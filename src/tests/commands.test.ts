import { describe, expect, test } from 'vitest'

import { CommandDefinitions, parseCommandStr } from '../libs/commands'

test('returns the default command with an empty string', () => {
  expect(parseCommandStr('')).toMatchObject({ type: 'default' })
})

test('returns the default command with an empty string', () => {
  expect(parseCommandStr('')).toMatchObject({ type: 'default' })
})

test('returns the default command for unknown commands', () => {
  expect(parseCommandStr('unknown')).toMatchObject({ type: 'default' })
})

describe.each([Object.keys(CommandDefinitions)])(`handles the '%s' command`, (commandStr) => {
  test('returns the correct type', () => {
    expect(parseCommandStr(getCommandKeyword(commandStr))).toMatchObject({ type: commandStr })
  })

  test('trims command strings', () => {
    expect(parseCommandStr(` ${getCommandKeyword(commandStr)} `)).toMatchObject({ type: commandStr })
  })

  test('returns the correct type and query', () => {
    expect(parseCommandStr(`${getCommandKeyword(commandStr)} this is a test`)).toMatchObject({
      type: commandStr,
      query: 'this is a test',
    })
  })

  test('returns the default command if a known keyword is used as a query', () => {
    expect(parseCommandStr(`unknown ${getCommandKeyword(commandStr)}`)).toMatchObject({
      type: 'default',
    })
  })
})

test('returns redirect URLs', () => {
  expect(parseCommandStr(getCommandKeyword('changelog')).redirect).toMatchInlineSnapshot(
    `"https://github.com/withastro/starlight/blob/main/packages/starlight/CHANGELOG.md"`,
  )
})

test('replaces query placeholders in redirect URLs', () => {
  expect(parseCommandStr(`${getCommandKeyword('code_search')} this is a test`).redirect).toMatchInlineSnapshot(
    `"https://github.com/search?q=repo%3Awithastro%2Fstarlight%20this%20is%20a%20test&type=code"`,
  )
})

function getCommandKeyword(commandType: string) {
  return CommandDefinitions[commandType as keyof typeof CommandDefinitions].keyword
}
