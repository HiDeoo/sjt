const gitHubBaseUrl = 'https://github.com'
const starlightGitHubUrl = `${gitHubBaseUrl}/withastro/starlight`
const starlightDocsUrl = 'https://starlight.astro.build'
const searchEngineUrl = 'https://duckduckgo.com/?q=%21%20'

export const CommandDefinitions = {
  changelog: {
    keyword: 'c',
    redirect: `${starlightGitHubUrl}/blob/main/packages/starlight/CHANGELOG.md`,
  },
  code_search: {
    keyword: 's',
    redirect: `${gitHubBaseUrl}/search?q=repo%3Awithastro%2Fstarlight%20__SJT_QUERY__&type=code`,
  },
  discussions: {
    keyword: 'd',
    redirect: `${starlightGitHubUrl}/discussions`,
  },
  github: {
    keyword: 'g',
    redirect: `${starlightGitHubUrl}/`,
  },
  home: {
    keyword: 'h',
    redirect: starlightDocsUrl,
  },
  issues: {
    keyword: 'i',
    redirect: `${starlightGitHubUrl}/issues`,
  },
  pull_requests: {
    keyword: 'p',
    redirect: `${starlightGitHubUrl}/pulls`,
  },
  releases: {
    keyword: 'r',
    redirect: `${starlightGitHubUrl}/releases`,
  },
  last_release: {
    keyword: 'lr',
    redirect: `${starlightGitHubUrl}/releases/latest`,
  },
} as const satisfies Record<string, CommandDefinition>

const commandRegex = /^(?<keyword>\w+)(?:\s+(?<query>.*))?$/

const commandKeywords = new Set(Object.values(CommandDefinitions).map((definition) => definition.keyword))
const commandKeywordsMap = new Map<CommandKeyword, CommandType>(
  Object.entries(CommandDefinitions).map(([type, definition]) => [definition.keyword, type as CommandType]),
)

export function parseCommandStr(commandStr: string): Command {
  const sanitizedCommandStr = commandStr.toLowerCase().trim()
  if (sanitizedCommandStr.length === 0) return { type: 'invalid' }

  const searchCommand: Command = makeCommand({
    type: 'search',
    query: `site:${starlightDocsUrl} ${commandStr}`,
    redirect: `${searchEngineUrl}__SJT_QUERY__`,
  })

  const match = sanitizedCommandStr.match(commandRegex)
  const { keyword, query } = match?.groups ?? {}
  if (keyword === undefined || keyword.length === 0) return searchCommand

  const commandDefinition = getCommandDefinitionFromKeyword(keyword)
  if (!commandDefinition) return searchCommand

  const [type, { keyword: _, ...definition }] = commandDefinition

  const command: Command = { ...definition, type, query }

  return makeCommand(command)
}

function getCommandDefinitionFromKeyword(keyword: string): [CommandType, CommandDefinition] | undefined {
  const commandType = commandKeywordsMap.get(keyword as CommandKeyword)

  return commandType ? [commandType, CommandDefinitions[commandType]] : undefined
}

function makeCommand(command: Command): Command {
  if (command.redirect) {
    command.redirect = command.redirect.replaceAll('__SJT_QUERY__', encodeURIComponent(command.query ?? ''))
  }

  return command
}

interface CommandDefinition {
  keyword: string
  redirect?: string
}

type CommandType = keyof typeof CommandDefinitions
type CommandKeyword = typeof commandKeywords extends Set<infer TType> ? TType : never

interface Command extends Omit<CommandDefinition, 'keyword'> {
  type: CommandType | 'search' | 'invalid'
  query?: string | undefined
}
