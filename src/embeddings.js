import {pipeline} from '@xenova/transformers'

const generateEmbeddings = async(text)=>{
   const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const result  = await embedder(text)
  console.log(result.data);
  
}

generateEmbeddings("Hello world!")