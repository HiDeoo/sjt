const gitHubBaseUrl = 'https://github.com'
const starlightGitHubUrl = `${gitHubBaseUrl}/withastro/starlight`
const starlightDocsUrl = 'https://starlight.astro.build'
const searchEngineUrl = 'https://duckduckgo.com/?no_redirect=0&q=! '

// TODO(HiDeoo) reorder
export const CommandDefinitions = {
  changelog: {
    description: 'Changelog',
    example: 'c',
    keyword: 'c',
    redirect: `${starlightGitHubUrl}/blob/main/packages/starlight/CHANGELOG.md`,
  },
  code_search: {
    description: 'Code search the provided query',
    example: 's AstroUserConfig',
    keyword: 's',
    redirect: `${gitHubBaseUrl}/search?q=repo%3Awithastro%2Fstarlight%20__SJT_QUERY__&type=code`,
  },
  discussions: {
    description: 'Discussions',
    example: 'd',
    keyword: 'd',
    redirect: `${starlightGitHubUrl}/discussions`,
  },
  github: {
    description: 'GitHub repository',
    example: 'g',
    keyword: 'g',
    redirect: `${starlightGitHubUrl}/`,
  },
  home: {
    description: 'Homepage',
    example: 'h',
    keyword: 'h',
    redirect: starlightDocsUrl,
  },
  issues: {
    description: 'Issues',
    example: 'i',
    keyword: 'i',
    redirect: `${starlightGitHubUrl}/issues`,
  },
  pull_requests: {
    description: 'Pull requests',
    example: 'p',
    keyword: 'p',
    redirect: `${starlightGitHubUrl}/pulls`,
  },
  releases: {
    description: 'Releases',
    example: 'r',
    keyword: 'r',
    redirect: `${starlightGitHubUrl}/releases`,
  },
  last_release: {
    description: 'Last release',
    example: 'lr',
    keyword: 'lr',
    redirect: `${starlightGitHubUrl}/releases/latest`,
  },
} as const satisfies Record<string, CommandDefinition>

const commandRegex = /^(?<keyword>\w+)(?:[\s+]+(?<query>.*))?$/i

const commandKeywords = new Set(Object.values(CommandDefinitions).map((definition) => definition.keyword))
const commandKeywordsMap = new Map<CommandKeyword, CommandType>(
  Object.entries(CommandDefinitions).map(([type, definition]) => [definition.keyword, type as CommandType]),
)

export function parseCommandStr(commandStr: string): Command {
  const sanitizedCommandStr = commandStr.trim()
  if (sanitizedCommandStr.length === 0) return { type: 'invalid' }

  const commandStrSearchCommand: Command = makeCommand({
    type: 'search',
    query: `site:${starlightDocsUrl} ${commandStr}`,
    redirect: `${searchEngineUrl}__SJT_QUERY__`,
  })

  const match = sanitizedCommandStr.match(commandRegex)
  const { keyword, query } = match?.groups ?? {}
  if (keyword === undefined || keyword.length === 0) return commandStrSearchCommand

  const commandDefinition = getCommandDefinitionFromKeyword(keyword)
  if (!commandDefinition) return commandStrSearchCommand

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
    command.redirect = command.redirect.replaceAll('__SJT_QUERY__', command.query ?? '')
  }

  return command
}

interface CommandDefinition {
  description?: string
  example?: string
  keyword: string
  redirect?: string
}

type CommandType = keyof typeof CommandDefinitions
type CommandKeyword = typeof commandKeywords extends Set<infer TType> ? TType : never

interface Command extends Omit<CommandDefinition, 'keyword'> {
  type: CommandType | 'search' | 'invalid'
  query?: string | undefined
}
