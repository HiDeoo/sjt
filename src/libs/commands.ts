export const CommandDefinitions = {
  changelog: {
    keyword: 'c',
    redirect: 'https://github.com/withastro/starlight/blob/main/packages/starlight/CHANGELOG.md',
  },
  code_search: {
    keyword: 's',
    redirect: 'https://github.com/search?q=repo%3Awithastro%2Fstarlight%20%SJT_QUERY%&type=code',
  },
} as const satisfies Record<string, CommandDefinition>

const commandRegex = /^(?<keyword>\w+)(?:\s+(?<query>.*))?$/

const commandKeywords = new Set(Object.values(CommandDefinitions).map((definition) => definition.keyword))
const commandKeywordsMap = new Map<CommandKeyword, CommandType>(
  Object.entries(CommandDefinitions).map(([type, definition]) => [definition.keyword, type as CommandType]),
)

const defaultCommand = { type: 'default' } satisfies Command

export function parseCommandStr(commandStr: string): Command {
  const sanitizedCommandStr = commandStr.toLowerCase().trim()
  if (sanitizedCommandStr.length === 0) return defaultCommand

  const match = sanitizedCommandStr.match(commandRegex)
  if (!match) return defaultCommand
  const { keyword, query } = match.groups ?? {}
  if (keyword === undefined || keyword.length === 0) return defaultCommand

  const commandDefinition = getCommandDefinitionFromKeyword(keyword)
  if (!commandDefinition) return defaultCommand

  const [type, { keyword: _, ...definition }] = commandDefinition

  const command: Command = { ...definition, type, query }

  if (command.redirect) {
    command.redirect = command.redirect.replaceAll('%SJT_QUERY%', encodeURIComponent(query ?? ''))
  }

  return command
}

function getCommandDefinitionFromKeyword(keyword: string): [CommandType, CommandDefinition] | undefined {
  const commandType = commandKeywordsMap.get(keyword as CommandKeyword)

  return commandType ? [commandType, CommandDefinitions[commandType]] : undefined
}

interface CommandDefinition {
  keyword: string
  redirect?: string
}

type CommandType = keyof typeof CommandDefinitions
type CommandKeyword = typeof commandKeywords extends Set<infer TType> ? TType : never

interface Command extends Omit<CommandDefinition, 'keyword'> {
  type: CommandType | 'default'
  query?: string | undefined
}
