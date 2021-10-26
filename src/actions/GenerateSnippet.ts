import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { ensureSingleTarget } from "../util/targetUtils";
import { range, repeat } from "lodash";

export default class GenerateSnippet implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);
    const editor = target.selection.editor;

    const snippetLines: string[] = [];
    let currentTabCount = 0;
    let currentIndentationString: string | null = null;

    const { start, end } = target.selection.selection;
    const startLine = start.line;
    const endLine = end.line;
    range(startLine, endLine + 1).forEach((lineNumber) => {
      const line = editor.document.lineAt(lineNumber);
      const { text, firstNonWhitespaceCharacterIndex } = line;
      const newIndentationString = text.substring(
        0,
        firstNonWhitespaceCharacterIndex
      );

      if (currentIndentationString != null) {
        if (newIndentationString.length > currentIndentationString.length) {
          currentTabCount++;
        } else if (
          newIndentationString.length < currentIndentationString.length
        ) {
          currentTabCount--;
        }
      }

      currentIndentationString = newIndentationString;

      const lineContentStart = Math.max(
        firstNonWhitespaceCharacterIndex,
        lineNumber === startLine ? start.character : 0
      );
      const lineContentEnd = Math.min(
        text.length,
        lineNumber === endLine ? end.character : Infinity
      );
      const snippetIndentationString = repeat("\t", currentTabCount);
      const lineContent = text.substring(lineContentStart, lineContentEnd);
      snippetLines.push(snippetIndentationString + lineContent);
    });

    console.log(`snippetLines: ${JSON.stringify(snippetLines)}`);

    return {
      thatMark: targets.map((target) => target.selection),
    };
  }
}
