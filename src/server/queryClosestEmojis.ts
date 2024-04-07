'use server'

import { cache } from '@solidjs/router'
import * as use from '@tensorflow-models/universal-sentence-encoder'
import * as tf from '@tensorflow/tfjs'
import embeddings from '~/assets/embeddings.json'

const cosineSimilarity = (vector1: number[], vector2: number[]) => {
  let dotProduct = 0
  let normal1 = 0
  let normal2 = 0
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i]
    normal1 += vector1[i] ** 2
    normal2 += vector2[i] ** 2
  }
  return dotProduct / (Math.sqrt(normal1) * Math.sqrt(normal2))
}

const findClosestEmojis = (embedding: number[]) => {
  return Object.entries(embeddings)
    .map(([emoji, vectors]) => {
      return {
        emoji,
        similarity: Object.values(vectors)
          .map(vector => cosineSimilarity(embedding, vector as number[]))
          .sort((a, b) => b - a)[0],
      }
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 20)
}

let model: use.UniversalSentenceEncoder
let modelPromise: Promise<use.UniversalSentenceEncoder>
const init = async () => {
  console.log('start model initialisation')
  // console.log('cold start')
  await tf.ready()
  modelPromise = use.load()
  model = await modelPromise
  console.log('model initialised')
}
init()

export const queryClosestEmojis = cache(async (query: string) => {
  if (!model) {
    model = await modelPromise
  }
  if (query === '') return []
  const embeddingMatrix = await model.embed([query])
  const embedding = (await embeddingMatrix.array())[0]

  return findClosestEmojis(embedding)
}, 'query')
