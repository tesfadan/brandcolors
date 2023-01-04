import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { Configuration, OpenAIApi } from "openai";
// import { OPENAI_API_KEY} from "../secrets"


// const apiKey =()=>{
//   if (process.env.NODE_ENV === 'production') {
//     // the app is running in production mode
//     return process.env.OPENAI_API_KEY
//   } else {
//     // the app is running in development mode
//     return OPENAI_API_KEY
//   }
// }


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});


const openai = new OpenAIApi(configuration);

const starterPrompt = `"I'll ask you to come up with brand colors from the text prompts and you send them in the following format.  Respond as a JSON object, don't include line breaks. \n\nreponse template:\n{\n  \"title\": \"[summarized version of the input prompt]\",\n "justification": "[Why this set of colors are selected] for example: Forest green and lime green represent nature, and the cloud white stands for freshness and purity",\n \"primary\": { \"name\": \"Forest Green\", \"color\": \"#3D8D3F\", \"type\": \"dark\"},\n  \"secondary\": { \"name\": \"Cloud White\", \"color\": \"#FFFFFF\", \"type\": \"light\"},\n  \"accent\": { \"name\": \"Lime Green\", \"color\": \"#A2CD3F\", \"type\": \"dark\"}\n}\n\nHow is that?\n\nYes, that looks correct!\n`


type ColorPalette = {
  title: string,
  justification: string,
  primary: {
    name: string,
    color: string,
    type: "dark" | "light"
  },
  secondary: {
    name: string,
    color: string,
    type: "dark" | "light"
  },
  accent: {
    name: string,
    color: string,
    type: "dark" | "light"
  }
}

const HCard =({brand} :{brand:ColorPalette })=>{
  return  (
  <div style={{
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    alignItems: "left",
    width: "max-content"
  }}>
 
  <p style={{
    fontSize: 12,
    marginBottom: 4,
  }}>{brand.title}</p>
   <div style={{display: "flex" }}>
     <div style={{backgroundColor: brand.primary.color, height: 24, width: 44 }} />
     <div style={{backgroundColor: brand.secondary.color, height: 24, width: 44 }} />
     <div style={{backgroundColor: brand.accent.color, height: 24, width: 44 }} />
   </div>
  </div>
   )
 }


function App() {
  const [input, setInput] = useState("");

  const [prompt, setPrompt] = useState(starterPrompt);

  const [loading, setLoading] = useState(false);

  
  const [brandColors, setBrandColors] = useState<ColorPalette | undefined>  ();

  const [history, setHistory] = useState<ColorPalette[]>  ();


  const handleSubmit = async (e: { preventDefault: () => void; })=>{
    e.preventDefault();

    const p = `${starterPrompt} ${input}.`;
    setPrompt(p);
    setLoading(true);

    if(brandColors && history){
      setHistory([...history, brandColors])
    } else if(brandColors){
      setHistory([brandColors]);
    }
    

   await openai.createCompletion({
      model: "text-davinci-003",
      prompt: p,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
    .then(res =>{
      setInput("");
       console.log(res.data.choices[0].text)
      //  setBrandColors(res.data.choices[0].text)

      const text = res.data.choices[0].text;

      text !== undefined ? setBrandColors(JSON.parse(text)) : null;

      })
    .catch(err => {
      setInput("");
      console.log(err)
    })
    .finally(()=>{
      setLoading(false)
    })
  }

  const Box =({color} : {color: {color: string, type: string, name: string}})=> <div style={{
    backgroundColor: color.color,
    height: 24,
    width: 156,
    padding: 12,
    color: color.type == "light" ? '#000' : '#fff'
  }}>{color.name}</div>

  return (
    <div className="App">
      {
        loading ? 
        <p>Loading</p>
        :
        <>

      <form onSubmit={handleSubmit}
        style={{
          marginBottom: 32,
          display: "flex",
          minWidth: 720,
          fontSize: 20
        }}
      >
        <input
          style={{
            height: 44,
            width: "100%",
            fontSize: 16,
            padding: 12,
            borderRadius: 12,
            border: "0",
            outlineColor: "#fff",
            outlineWidth: 1,
          }}
        placeholder="Type brand/startup description" className='promptInput' type="text" value={input} onChange={event => setInput(event.target.value)} />
      <input 
          style={{
            height: "inherit",
            padding: "0px 32px",
            display: "none",
          }}
      className='submit' type="submit" value="Send" />
      </form>

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>

        {brandColors !== undefined ?
          <>
            <h4>{brandColors.title}</h4>
            <div style={{
              display: "flex",
              gap: 16
            }}>
              <Box color={brandColors.primary}/>
              <Box color={brandColors.secondary}/>
              <Box color={brandColors.accent}/>
            </div>

            <p>{brandColors.justification}</p> 
          </>

          :
          <>
          </>
      }
      </div>
      </>
}

    <div style={{display: "flex", gap: 16, justifyContent: "flex-start", position: "absolute", bottom: 96}}>
    {history?.map(brand => <HCard brand={brand} />)}
    </div>
  
  </div>
  )
}

export default App


