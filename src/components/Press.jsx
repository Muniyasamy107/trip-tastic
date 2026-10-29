import { Fragment } from 'react'
import { press } from '../data'

export default function Press() {
  return (
    <section className="press" aria-label="As featured in">
      <div className="shell press__inner">
        <span className="press__label">As featured in</span>
        {press.map((name, i) => (
          <Fragment key={name}>
            <span className="press__item">{name}</span>
            {i < press.length - 1 && <span className="press__dot" aria-hidden="true" />}
          </Fragment>
        ))}
      </div>
    </section>
  )
}
