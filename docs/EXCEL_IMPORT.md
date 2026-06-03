# Excel Question Import

## Supported Formats

- `.xlsx`, `.xls`, `.csv`

## Required Columns

| Column        | Aliases                | Description         |
| ------------- | ---------------------- | ------------------- |
| question      | Question               | Question text       |
| optionA       | option_a, A, OptionA   | Option A            |
| optionB       | option_b, B, OptionB   | Option B            |
| optionC       | option_c, C, OptionC   | Option C            |
| optionD       | option_d, D, OptionD   | Option D            |
| correctAnswer | correct_answer, Answer | A, B, C, or D       |
| marks         | Marks                  | Points (default: 1) |

## Example

| question     | optionA | optionB | optionC | optionD | correctAnswer | marks |
| ------------ | ------- | ------- | ------- | ------- | ------------- | ----- |
| What is 2+2? | 3       | 4       | 5       | 6       | B             | 1     |

## Acceptable header aliases

- `optionA`: `option_a`, `OptionA`, `A`, `option1`, `option 1`, `opt1`
- `optionB`: `option_b`, `OptionB`, `B`, `option2`, `option 2`, `opt2`
- `optionC`: `option_c`, `OptionC`, `C`, `option3`, `option 3`, `opt3`
- `optionD`: `option_d`, `OptionD`, `D`, `option4`, `option 4`, `opt4`
- `correctAnswer`: `correct_answer`, `Answer`, `correct`, `1`, `2`, `3`, `4`

Rows with missing required fields are skipped.
