import stripAnsi from 'strip-ansi'
import { dialects } from '@cucumber/gherkin'
import type { HookStats, TestStats } from '@wdio/reporter'

import { FAILED } from './constants.js'
import type { ErrorMessage, Step } from './types'

/**
 * Return the list of step keywords in the specified language
 *
 * @param language {string}
 *
 * @return {string[]}
 */
export function getStepKeywords(language: string): string[] {
    const dialect = dialects[language]
    return ([] as string[])
        .concat(dialect.given, dialect.when, dialect.then, dialect.and)
        .map((keyword) => keyword.replace(/\s*$/, ''))
}

/**
 * Add a failed message
 *
 * @param {object}  testObject
 *
 * @return {object}
 */
export function getFailedMessage(testObject: TestStats | HookStats): ErrorMessage {
    if (testObject.state === FAILED) {
        return {
            error_message: stripAnsi(testObject.error.stack),
        }
    }

    return {}
}

/**
 * Check if the steps contain valid steps
 *
 * @param {array} steps
 *
 * @param {string} language
 *
 * @return {boolean}
 */
export function containsSteps(steps: Step[], language: string): boolean {
    const stepKeywords = getStepKeywords(language)
    return steps.some((step) => stepKeywords.includes(step.keyword))
}

/**
 * Returns the first word in case it's a keyword in the specified language
 *
 * @param {array} title
 *
 * @param {string} language
 *
 * @return {string|undefined}
 */
export function keywordStartsWith(title: string, language: string): string | undefined {
    const stepKeywords = [].concat(getStepKeywords(language), ['After', 'Before'])
    const escapedStepKeywords = stepKeywords.map((keyword: string) =>
        keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    const regex = new RegExp(`^(${escapedStepKeywords.join('|')})\\s`)
    return (regex.exec(title) || []).pop()
}
