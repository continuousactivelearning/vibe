import {parse} from 'mathjs';
import {QuestionParameter, LotItem} from '../../classes/validators';

export class ParameterizedQuestionRules {
  static ensureParameterizedTagPresence(text: string): void {
    const hasQParam = /<QParam>.*?<\/QParam>/s.test(text);
    const hasNumExpr = /<NumExpr>.*?<\/NumExpr>/s.test(text);
    if (!hasQParam && !hasNumExpr) {
      throw new Error(
        'A parameterized question must include <QParam> or <NumExpr> in its text.',
      );
    }
  }

  static extractNumExprs(text: string): string[] {
    const regex = /<NumExpr>(.*?)<\/NumExpr>/gs;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  static validateMathExpressions(
    exprs: string[],
    parameters: QuestionParameter[],
  ): void {
    const paramMap = new Map(parameters.map(p => [p.name, p]));

    // for (const expr of exprs) {
    //   try {
    //     const node = parse(expr);
    //     const variables = node.filter(n => n.isSymbolNode).map(n => n.name);
    //     for (const v of variables) {
    //       const param = paramMap.get(v);
    //       if (!param) throw new Error(`Variable '${v}' not found in parameters.`);
    //       if (param.type !== 'number') throw new Error(`Variable '${v}' must be of type 'number'.`);
    //     }
    //   } catch (err) {
    //     throw new Error(`Invalid math expression '${expr}': ${(err as Error).message}`);
    //   }
    // }
  }

  static checkLotItemsParameterized(lotItems: LotItem[]): void {
    const qParamRegex = /<QParam>[\s\S]*?<\/QParam>/;
    const numExprRegex = /<NumExpr>[\s\S]*?<\/NumExpr>/;

    let found = false;

    for (const item of lotItems) {
      if (qParamRegex.test(item.text) || numExprRegex.test(item.text)) {
        found = true;
        break;
      }

      if (!found) {
        throw new Error(
          'At least one LotItem must contain a <QParam> or <NumExpr> tag.',
        );
      }
    }
  }
}
