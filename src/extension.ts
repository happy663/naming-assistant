// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

const openaiEndpoint =
  'https://api.openai.com/v1/engines/davinci-codex/completions';
const openaiApiKey = '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';

async function getNamingSuggestions(input: string): Promise<string[]> {
  const prompt = `Naming suggestions for "${input}":`;
  const response = await axios.post(
    openaiEndpoint,
    {
      prompt: prompt,
      max_tokens: 50,
      n: 1,
      stop: null,
      temperature: 0.7,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
    }
  );

  const suggestions = response.data.choices[0].text
    .split(',')
    .map((s) => s.trim());
  return suggestions;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.getNamingSuggestions',
    async () => {
      const input = await vscode.window.showInputBox({
        prompt: '命名候補を取得したい言葉を入力してください',
      });

      if (!input) {
        return;
      }

      try {
        const suggestions = await getNamingSuggestions(input);

        const selectedItem = await vscode.window.showQuickPick(suggestions, {
          placeHolder: '選択してください',
        });

        if (!selectedItem) {
          return;
        }

        const activeEditor = vscode.window.activeTextEditor;

        if (!activeEditor) {
          vscode.window.showErrorMessage(
            'テキストエディタが開かれていません。'
          );
          return;
        }

        activeEditor.edit((editBuilder) => {
          const currentPosition = activeEditor.selection.active;
          editBuilder.insert(currentPosition, selectedItem);
        });
      } catch (error) {
        vscode.window.showErrorMessage('命名候補の取得に失敗しました。');
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
