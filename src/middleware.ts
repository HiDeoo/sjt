import { defineMiddleware } from 'astro:middleware'

import { parseCommandStr } from './libs/commands'

export const onRequest = defineMiddleware((context, next) => {
  console.warn('> middleware: onRequest')

  const url = new URL(context.url)
  console.warn('> middleware: url.pathname', url.pathname)
  if (url.pathname !== '/') return next()

  const query = url.searchParams.get('q')
  console.warn('> middleware: query', query)
  if (!query) return next()

  const command = parseCommandStr(query)
  console.warn('> middleware: command.type', command.type)
  if (command.type === 'invalid' || !command.redirect) return next()

  return new Response(null, {
    status: 302,
    headers: {
      Location: command.redirect,
    },
  })
})
