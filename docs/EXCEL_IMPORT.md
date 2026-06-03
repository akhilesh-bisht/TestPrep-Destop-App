# Excel Question Import

## Supported Formats

- `.xlsx`, `.xls`, `.csv`

## Required Columns

| Column | Aliases | Description |
|--------|---------|-------------|
| question | Question | Question text |
| optionA | option_a, A, OptionA | Option A |
| optionB | option_b, B, OptionB | Option B |
| optionC | option_c, C, OptionC | Option C |
| optionD | option_d, D, OptionD | Option D |
| correctAnswer | correct_answer, Answer | A, B, C, or D |
| marks | Marks | Points (default: 1) |

## Example

| question | optionA | optionB | optionC | optionD | correctAnswer | marks |
|----------|---------|---------|---------|---------|---------------|-------|
| What is 2+2? | 3 | 4 | 5 | 6 | B | 1 |

Rows with missing required fields are skipped.
