
## Code Formatting Style

The following formatting rules are enforced by ESLint and should be adhered to:

- **Brace Style**: Use Allman style braces (braces on their own line). Single-line blocks are allowed.
    ```javascript
    // Correct
    if (condition)
    {
            // code
    }
    else
    {
            // code
    }

    if (condition) { /* code */ } // Also correct for single line
    ```
- **Indentation**: Use 4 spaces for indentation.
- **Tabs**: Do not use tabs; use spaces instead.
- **Comma Dangle**: Use trailing commas for multiline object literals, array literals, function parameters, etc.
- **Line length**: Try to keep the line length to a maximum of 80 columns when possible

## TypeScript Configuration

The following TypeScript compiler options from `tsconfig.json` directly influence how you should write code:

- **`strict: true`**: This is a critical setting that enables a comprehensive suite of type-checking rules. When writing code, adhere to the following implications:
    - **Explicit Types**: Variables must have explicit types if their type cannot be immediately inferred by TypeScript. Avoid using `any` unless there is a very specific and justified reason (due to `noImplicitAny`).
    - **Null and Undefined Handling**: Values that can be `null` or `undefined` must be explicitly typed as such (e.g., `string | null`). You must perform checks for `null` or `undefined` before attempting to use these values (due to `strictNullChecks`).
    - **No Unused Variables or Parameters**: Unused local variables and function parameters will be flagged as errors by the compiler (due to `noUnusedLocals` and `noUnusedParameters`). Ensure all declared variables and parameters serve a purpose in your code.
    - **Consistent Function Returns**: If a function is declared to return a value, all possible code paths within that function must explicitly return a value of the declared type (due to `noImplicitReturns`).
