import { createAsync } from '@solidjs/router'
import { For, Suspense, createSignal } from 'solid-js'

import { queryClosestEmojis } from '~/server/queryClosestEmojis'
import './index.css'

const LoadingIndicator = () => <div class="loading-indicator">loading...</div>

const App = () => {
  const [text, setText] = createSignal('')
  const [query, setQuery] = createSignal('')

  const closestEmojis = createAsync(() => queryClosestEmojis(query()))

  return (
    <>
      <main>
        <div class="search-container">
          <form
            target="_blank"
            onSubmit={event => {
              event.preventDefault()
              setQuery(text())
            }}
          >
            <input
              type="text"
              value={text()}
              onInput={e => setText(e.currentTarget.value)}
              placeholder="Enter text here..."
              spellcheck={false}
            />
          </form>

          <Suspense fallback={<LoadingIndicator />}>
            <div class="emoji-container">
              <For each={closestEmojis()}>{emoji => <span innerText={emoji.emoji} />}</For>
            </div>
          </Suspense>
        </div>
      </main>
      <footer>
        <h1>Search emojis with USE embeddings.</h1>
        <a>link</a>
      </footer>
    </>
  )
}

export default App
