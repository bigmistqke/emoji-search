import * as use from '@tensorflow-models/universal-sentence-encoder'
import * as tf from '@tensorflow/tfjs-node'
import emojilib from 'emojilib'
import * as fs from 'fs'

const generateEmbeddings = async () => {
  await tf.ready()
  const model = await use.load()

  let emojiEmbeddings: Record<string, Record<string, number[]>> = {}

  for (const [emoji, keywords] of Object.entries(emojilib)) {
    emojiEmbeddings[emoji] = {}
    for (const keyword of keywords) {
      const embeddings = await model.embed(keyword)
      emojiEmbeddings[emoji][keyword] = Array.from(embeddings.dataSync()).map(value =>
        parseFloat(value.toFixed(3)),
      )
    }
  }

  fs.writeFileSync('./emojiEmbeddings.json', JSON.stringify(emojiEmbeddings, null, 2))
  console.log('Emoji embeddings have been generated and saved.')
}

generateEmbeddings()
