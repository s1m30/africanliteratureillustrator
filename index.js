
import { process } from '/env'
import { Configuration, OpenAIApi } from 'openai'

const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('movie-boss-text')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

document.getElementById("send-btn").addEventListener("click", () => {
  const setupTextarea = document.getElementById('setup-textarea')
  if (setupTextarea.value) {
    const userInput = setupTextarea.value
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
    fetchBotReply(userInput)
    fetchSynopsis(userInput)
  }
})

async function fetchBotReply(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
/*
1. Refactor this prompt to use examples of an outline and an 
   enthusiastic response. Be sure to keep the length of your 
   examples reasonably short, say 20 words or so.
*/
    prompt: `Generate a short message to enthusiastically say the excerpt sounds interesting and that you would like to illustrate it.
    ###
    outline:  Temi and I used to argue with other people about how children are the
    worst kind of pollution, that really if we wanted to help the planet we should
    kill half of the population, then ourselves, and use the remains as compost for
    planting trees.
    message: This looks like an interesting part of the book. I would love to illustrate it for you! Especially the part where they argue about killing half of the population!
    ###
    outline:  Ugwu stood by the door, waiting. Sunlight streamed in through the
    windows, and from time to time a gentle breeze lifted the curtains..
    message: I'll spend a few moments considering that. But I love your idea!! A beautiful scenery involving curtains and windows!
    ###
    outline: ${outline}
    message: 
    `,
    max_tokens: 60 
  })
  movieBossText.innerText = response.data.choices[0].text.trim()
  console.log(response) 
} 

async function fetchSynopsis(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate an engaging, professional and educative analysis based on an african literature excerpt
    ###
    outline: At the gates, Biafran soldiers were waving cars through. They
    looked distinguished in their khaki uniforms, boots shining, half of a
    yellow sun sewn on their sleeves. Ugwu wished he was one of them.
    Master waved and said, "Well done!"
    synopsis:The Biafran Armed Forces (BAF) were the military of the Nigerian secessionist state of Biafra, which existed from 1967 until 1970. They participated in the Nigerian–Biafran War or the Biafran War, whicg was a civil war fought between Nigeria and the Republic of Biafra, a secessionist state which had declared its independence from Nigeria in 1967. It seems one of the characters named Ugwu really wanted to be part of them and fight alongside them against the Nigerian forces.
    ###
    outline: ${outline}
    synopsis: 
    `,
    max_tokens: 700
  }) 
  const synopsis = response.data.choices[0].text.trim()
  document.getElementById('output-text').innerText = synopsis
  fetchImagePromt(synopsis)
}

async function fetchImagePromt(synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Give a short description of an image which illustrates events, characters or objects from african literature excerpts.
    ###
    excerpt: "But there was no such doubt anywhere about his skin. It
    was smooth and black, and not a layer of fat between that skin and his flesh.
    His teeth, which he occasionally, deliberately and fashionably discoloured by
    chewing kola, were beautifully even and white. He wore kohl around his
    eyes, moved like a panther, and was very good looking."
    synopsis: ${synopsis}
    character: A fine looking man
    image description: A handsome african black man with beautiful white teeth, he wears kohl around his eyes and runs as fast as a panther.
    `,
    temperature: 0.8,
    max_tokens: 100
  })
  fetchImageUrl(response.data.choices[0].text.trim())
}

async function fetchImageUrl(imagePrompt){
  const response = await openai.createImage({
    prompt: `${imagePrompt}. There should be no text in this image.`,
    n: 1,
    size: '256x256',
    response_format: 'b64_json' 
  })
  document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${response.data.data[0].b64_json}">`
  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
  document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  })
}