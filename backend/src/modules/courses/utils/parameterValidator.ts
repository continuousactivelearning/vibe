export function validateParametersInQuestionText(
  questionText: string,
  parameters: {parameterName: string}[],
): string[] {
  const missingParams: string[] = [];

  parameters.forEach(param => {
    const tag = `<QParam>${param.parameterName}</QParam>`;
    if (!questionText.includes(tag)) {
      missingParams.push(param.parameterName);
    }
  });

  return missingParams;
}
