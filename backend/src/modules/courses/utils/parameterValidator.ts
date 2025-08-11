export function validateParametersInQuestionText(
  questionText: string,
  parameters: {parameterName: string}[],
): string[] {
  const missingParameters: string[] = [];
  for (const param of parameters) {
    const regex = new RegExp(`<QParam>${param.parameterName}</QParam>`);
    if (!regex.test(questionText)) {
      missingParameters.push(param.parameterName);
    }
  }
  return missingParameters;
}
