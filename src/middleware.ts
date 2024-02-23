import { defineMiddleware } from 'astro:middleware'

import { parseCommandStr } from './libs/commands'

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.url)
  if (url.pathname !== '/') return next()

  const query = url.searchParams.get('q')
  if (!query || query.length === 0) return next()

  const command = parseCommandStr(query)

  if (command.type === 'default' || !command.redirect) return next()

  return new Response(null, {
    status: 302,
    headers: {
      Location: command.redirect,
    },
  })
})
