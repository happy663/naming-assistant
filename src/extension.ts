import * as vscode from 'vscode';
import { getNamingSuggestions } from './chatgpt';
import * as _ from 'lodash';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.getNamingSuggestions',
    async () => {
      // コマンドパレットから入力を受け取る
      const input = await vscode.window.showInputBox({
        prompt: '日本語テキストを入力してください',
      });
      if (!input) {
        return;
      }

      // ChatGPT APIを使って命名候補を取得する
      const suggestions = await getNamingSuggestions(input);

      // 命名候補からユーザが選択する
      const selectedSuggestion = await vscode.window.showQuickPick(
        suggestions,
        { placeHolder: '命名候補を選択してください' }
      );
      if (!selectedSuggestion) {
        return;
      }

      // ケースを選択する
      const cases = [
        'キャメルケース',
        'スネークケース',
        'パスカルケース',
        'ケバブケース',
      ];
      const selectedCase = await vscode.window.showQuickPick(cases, {
        placeHolder: '使用するケースを選択してください',
      });
      if (!selectedCase) {
        return;
      }

      // ユーザが選択したケースに合わせてテキストエディタに挿入する
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const formattedSuggestion = formatSuggestion(
          selectedSuggestion,
          selectedCase
        );
        editor.insertSnippet(
          new vscode.SnippetString(formattedSuggestion),
          editor.selection.active
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

function formatSuggestion(suggestion: string, caseType: string): string {
  switch (caseType) {
    case 'キャメルケース':
      return _.camelCase(suggestion);
    case 'スネークケース':
      return _.snakeCase(suggestion);
    case 'パスカルケース':
      return _.upperFirst(_.camelCase(suggestion));
    case 'ケバブケース':
      return _.kebabCase(suggestion);
    default:
      return suggestion;
  }
}
