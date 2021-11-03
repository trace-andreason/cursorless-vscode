import { commands } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { ensureSingleEditor } from "../util/targetUtils";
import { callFunctionAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { SnippetParser } from "../vendor/snippet/snippetParser";
import {
  parseSnippetLocation,
  findMatchingSnippetDefinition,
  transformSnippetVariables,
} from "../util/snippet";

export default class WrapWithSnippet implements Action {
  private snippetParser = new SnippetParser();

  getTargetPreferences(snippetLocation: string): ActionPreferences[] {
    const [snippetName, placeholderName] =
      parseSnippetLocation(snippetLocation);

    const snippet = this.graph.snippets.getSnippet(snippetName);

    if (snippet == null) {
      throw new Error(`Couldn't find snippet ${snippetName}`);
    }

    const variables = snippet.variables ?? {};
    const defaultScopeType = variables[placeholderName]?.wrapperScopeType;

    return [
      {
        insideOutsideType: "inside",
        modifier:
          defaultScopeType == null
            ? undefined
            : {
                type: "containingScope",
                scopeType: defaultScopeType,
                includeSiblings: false,
              },
      },
    ];
  }

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    snippetLocation: string
  ): Promise<ActionReturnValue> {
    const [snippetName, placeholderName] =
      parseSnippetLocation(snippetLocation);

    const snippet = this.graph.snippets.getSnippet(snippetName)!;

    const editor = ensureSingleEditor(targets);

    // Find snippet definition matching context.
    // NB: We only look at the first target to create our context. This means
    // that if there are two snippets that match two different contexts, and
    // the two targets match those two different contexts, we will just use the
    // snippet that matches the first context for both targets
    const definition = findMatchingSnippetDefinition(
      targets[0],
      snippet.definitions
    );

    if (definition == null) {
      throw new Error("Couldn't find matching snippet definition");
    }

    const parsedSnippet = this.snippetParser.parse(definition.body.join("\n"));

    transformSnippetVariables(parsedSnippet, placeholderName);

    const snippetString = parsedSnippet.toTextmateString();

    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0
    );

    const targetSelections = targets.map(
      (target) => target.selection.selection
    );

    await this.graph.actions.setSelection.run([targets]);

    // NB: We used the command "editor.action.insertSnippet" instead of calling editor.insertSnippet
    // because the latter doesn't support special variables like CLIPBOARD
    const [updatedTargetSelections] = await callFunctionAndUpdateSelections(
      this.graph.rangeUpdater,
      () =>
        commands.executeCommand("editor.action.insertSnippet", {
          snippet: snippetString,
        }),
      editor.document,
      [targetSelections]
    );

    return {
      thatMark: updatedTargetSelections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }
}
