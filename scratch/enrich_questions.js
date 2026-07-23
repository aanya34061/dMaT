const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../src/data/questions.json');
const rawData = fs.readFileSync(questionsPath, 'utf8');
const questions = JSON.parse(rawData);

const enriched = questions.map((q) => {
  const correctLetter = String.fromCharCode(65 + q.correctAnswer);
  const correctOptText = q.options[q.correctAnswer];

  // Specific enriched solutions for key topics and general builder for all questions
  let solutionObj = null;

  if (q.id === 1) {
    solutionObj = {
      understanding: "This problem asks us to choose the most memory-efficient and semantically appropriate primitive data types in Java for three real-world attributes: marital status (binary yes/no), age (small positive integer), and a person's full name (text string).",
      steps: [
        "Analyze 'married': A marital status is binary (true or false). The `boolean` data type is specifically designed for truth values.",
        "Analyze 'age': Human age ranges from 0 to ~120 years. A `short` is a 16-bit signed integer storing values from -32,768 to 32,767. It easily fits human age while conserving memory compared to standard 32-bit `int` or 32-bit `float`.",
        "Analyze 'name': Text characters require a character sequence. The `string` (or `String` object) type is used for textual representation.",
        "Combine the selected types: `boolean married; short age; string name;` matching Option C."
      ],
      diagram: {
        type: "truthTable",
        title: "Primitive Types & Memory Sizes",
        headers: ["Variable", "Required Value", "Best Type", "Memory Allocated"],
        rows: [
          ["married", "true / false", "boolean", "1 bit (conceptually) / 1 byte"],
          ["age", "0 to 120", "short", "16 bits (2 Bytes)"],
          ["name", "'Alice Smith'", "string", "Variable (UTF-16 chars)"]
        ]
      },
      finalAnswer: `Option C (\`${correctOptText}\`) is correct because \`boolean\` efficiently represents binary flags, \`short\` is optimal for small integer ranges like age, and \`string\` is necessary for text names.`,
      wrongOptions: [
        "Option A uses `float age;` which is incorrect because age is counted in discrete integers, not floating-point decimals, and consumes 32 bits unnecessarily.",
        "Option B uses `int married;` which wastes memory (32 bits instead of 1 bit) and lacks semantic clarity compared to `boolean`.",
        "Option C is the CORRECT answer.",
        "Option D uses `short married;` (confuses boolean with short integer) and `double name;` (floating point decimal for textual name), which causes a compile error."
      ],
      keyConcept: "Java Primitive Types & Data Sizing: Always pick the smallest, most domain-accurate type. Use `boolean` for logical flags, integer types (`byte`, `short`, `int`, `long`) for countable whole numbers, and `String` for text.",
      examTip: "Exam Shortcut: First eliminate options that use floating-point types (`float`, `double`) for non-decimal attributes like `name` or `age`. This quickly narrows down choices!",
      commonMistakes: "Using `float` or `double` for whole numbers (like age) or using `int` for binary flags (0/1 instead of true/false)."
    };
  } else if (q.id === 2) {
    solutionObj = {
      understanding: "This question tests Java's binary numeric promotion rules during arithmetic addition involving two `float` operands.",
      steps: [
        "In Java, arithmetic operations are evaluated in standard precision types (`int` for integer types, `double` for floating-point calculations).",
        "When two `float` values are added, Java promotes both operands to `double` precision before carrying out the addition.",
        "The calculation expression evaluates internally as a `double` value before any subsequent storage assignment."
      ],
      diagram: {
        type: "equation",
        title: "Implicit Type Promotion",
        content: "\\text{float} + \\text{float} \\xrightarrow{\\text{Implicit Promotion}} \\text{double} + \\text{double} = \\text{double}"
      },
      finalAnswer: `Option D (\`${correctOptText}\`) is correct because Java automatically converts floating-point additions to \`double\` precision to avoid precision loss.`,
      wrongOptions: [
        "Option A (`boolean`) is incorrect because arithmetic operations on numeric values never evaluate to a boolean condition.",
        "Option B (`float`) is incorrect because Java promotes single-precision float operands to double precision during calculation.",
        "Option C (`int`) is incorrect because floating-point numbers retain decimal precision and are not demoted to integers.",
        "Option D (`double`) is the CORRECT answer."
      ],
      keyConcept: "Java Binary Numeric Promotion: Arithmetic calculations are executed in at least `int` precision for integers and `double` precision for floating-point calculations unless explicitly cast.",
      examTip: "Remember: Operations with `float` or `double` promote to `double`. Operations with `byte`, `short`, or `char` promote to `int`.",
      commonMistakes: "Assuming `float + float` stays in `float` precision without promotion."
    };
  } else if (q.id === 3) {
    solutionObj = {
      understanding: "This problem checks how Java handles arithmetic division between two small integer types (`short`).",
      steps: [
        "Both operands are of type `short` (16-bit signed integers).",
        "According to Java's binary numeric promotion rules, any arithmetic operation (`+`, `-`, `*`, `/`) on types smaller than `int` automatically promotes both operands to `int` (32-bit).",
        "Therefore, `short / short` becomes `int / int`, yielding an `int` result."
      ],
      diagram: {
        type: "equation",
        title: "Integer Promotion Rule",
        content: "\\text{short} \\div \\text{short} \\xrightarrow{\\text{Binary Promotion}} \\text{int} \\div \\text{int} = \\text{int}"
      },
      finalAnswer: `Option B (\`${correctOptText}\`) is correct because arithmetic on \`short\` types promotes operands to \`int\` precision before division.`,
      wrongOptions: [
        "Option A (`float`) is incorrect because no floating-point numbers are present in the operation.",
        "Option B (`int`) is the CORRECT answer.",
        "Option C (`double`) is incorrect because integer division does not implicitly promote to double unless a double is explicitly involved.",
        "Option D (`short`) is incorrect because Java does not perform arithmetic directly in 16-bit `short` precision."
      ],
      keyConcept: "Integral Type Promotion: Operations involving `byte`, `short`, or `char` are automatically widened to `int` prior to calculation.",
      examTip: "Any binary arithmetic with types smaller than `int` (`byte`, `short`, `char`) ALWAYS promotes to `int`!",
      commonMistakes: "Thinking that dividing two `short` values returns a `short` without promotion."
    };
  } else if (q.id === 4) {
    solutionObj = {
      understanding: "We need to evaluate the step-by-step evaluation of the expression `float x = 3 + s/3` where `short s = 4`.",
      steps: [
        "Step 1: Evaluate `s / 3`. Here `s` (value 4) is a `short`, which promotes to `int`. `3` is an integer literal (`int`).",
        "Step 2: Perform integer division `4 / 3`. In integer division, the fractional part is truncated: `4 / 3 = 1`.",
        "Step 3: Perform addition `3 + 1 = 4` (integer addition).",
        "Step 4: Assign the integer result `4` to `float x`. It is implicitly converted to `4.0` (which formats as 4)."
      ],
      diagram: {
        type: "equation",
        title: "Expression Evaluation Pipeline",
        content: "x = 3 + (4 \\div 3)_{\\text{int}} = 3 + 1 = 4"
      },
      finalAnswer: `Option B (\`${correctOptText}\`) is correct. Integer division \`4 / 3\` truncates to \`1\`. Then \`3 + 1 = 4\`.`,
      wrongOptions: [
        "Option A (`4.33333333333`) is incorrect because `s/3` is integer division, so the decimal `.333` is truncated prior to addition.",
        "Option B (`4`) is the CORRECT answer.",
        "Option C (`3`) is incorrect because it ignores the result of the division step.",
        "Option D (`4.25`) is incorrect due to miscalculating the division."
      ],
      keyConcept: "Integer Division Truncation: When dividing two integers (`int / int`), Java truncates all digits after the decimal point BEFORE assigning or adding to floating-point variables.",
      examTip: "Always check the data types of operands in division first! If both are integers, division truncates decimal fractions completely.",
      commonMistakes: "Expecting floating-point division (`4.333...`) when operands are integers."
    };
  } else if (q.id === 5) {
    solutionObj = {
      understanding: "Calculate total memory required to store 1000 `float` variables in bits and convert to bytes.",
      steps: [
        "Step 1: Identify memory footprint of a single `float` variable: 1 `float` = 32 bits (4 Bytes) according to IEEE 754 standard.",
        "Step 2: Calculate total bits for 1000 variables: $1000 \\times 32\\text{ bits} = 32,000\\text{ bits}$.",
        "Step 3: Convert bits to bytes ($1\\text{ Byte} = 8\\text{ bits}$): $32,000 / 8 = 4,000\\text{ Bytes}$.",
        "Conclusion: 32000 Bit = 4000 Byte, matching Option C."
      ],
      diagram: {
        type: "truthTable",
        title: "Primitive Memory Footprints",
        headers: ["Type", "Bits per variable", "Bytes per variable", "1000 Variables Size"],
        rows: [
          ["byte", "8 bits", "1 Byte", "8000 Bits = 1000 Bytes"],
          ["short", "16 bits", "2 Bytes", "16000 Bits = 2000 Bytes"],
          ["float", "32 bits", "4 Bytes", "32000 Bits = 4000 Bytes"],
          ["double", "64 bits", "8 Bytes", "64000 Bits = 8000 Bytes"]
        ]
      },
      finalAnswer: `Option C (\`${correctOptText}\`) is correct: $1000 \\times 32\\text{ bits} = 32,000\\text{ bits} = 4,000\\text{ Bytes}$.`,
      wrongOptions: [
        "Option A (`16000 Bit = 2000 Byte`) represents memory for 1000 `short` variables (16 bits each), not `float`.",
        "Option B (`1000 Bit = 125 Byte`) represents 1 bit per variable, which is incorrect.",
        "Option C is the CORRECT answer.",
        "Option D (`32768 Bit = 4096 Byte`) incorrectly uses power-of-two binary prefixes (4KiB) instead of exact decimal variable count ($1000 \\times 4\\text{ B}$)."
      ],
      keyConcept: "Memory Calculation: Memory in bytes = $(\\text{Number of elements} \\times \\text{Size in bits per element}) / 8$. Standard size for `float` is 32 bits (4 Bytes).",
      examTip: "Quick multiplier: 1 float = 4 Bytes. For 1000 floats, simply do $1000 \\times 4 = 4000\\text{ Bytes}$ and $4000 \\times 8 = 32000\\text{ bits}$.",
      commonMistakes: "Confusing `float` (32-bit / 4 Byte) with `double` (64-bit / 8 Byte) or `short` (16-bit / 2 Byte)."
    };
  }

  // If already custom crafted, use it. Otherwise, create a rich 8-section solution based on explanation!
  if (!solutionObj) {
    solutionObj = {
      understanding: `This question focuses on ${q.topic} within ${q.chapter}. We are given: "${q.question}" and need to evaluate the exact logical or mathematical outcome among the 4 choices.`,
      steps: [
        `Analyze the problem statement and identify given inputs in ${q.topic}.`,
        `Apply core formulas, boolean truth rules, or type rules applicable to ${q.topic}.`,
        `Evaluate the expressions step-by-step to arrive at result: "${correctOptText}".`,
        `Verify that Option ${correctLetter} matches the derived solution precisely.`
      ],
      diagram: q.image ? {
        type: "image",
        title: "Question Diagram",
        content: q.image,
        caption: `Refer to diagram for Question ${q.id} in ${q.chapter}`
      } : {
        type: "truthTable",
        title: `Analysis for ${q.topic}`,
        headers: ["Step / Property", "Rule Applied", "Result"],
        rows: [
          ["Input / Problem", q.question.substring(0, 35) + "...", "Given"],
          ["Core Concept", q.topic, "Verified"],
          ["Correct Output", `Option ${correctLetter}`, correctOptText]
        ]
      },
      finalAnswer: `Option ${correctLetter} ("${correctOptText}") is correct. ${q.explanation}`,
      wrongOptions: q.options.map((opt, idx) => {
        if (idx === q.correctAnswer) {
          return `Option ${String.fromCharCode(65 + idx)} ("${opt}") is CORRECT.`;
        }
        return `Option ${String.fromCharCode(65 + idx)} ("${opt}") is INCORRECT because it does not satisfy the requirements of ${q.topic}.`;
      }),
      keyConcept: `Key Principle of ${q.topic}: ${q.explanation}`,
      examTip: `Exam Strategy: For ${q.topic} questions on Page ${q.bookPage}, eliminate choices with invalid type conversions or mismatched boolean logic early.`,
      commonMistakes: `Typical Pitfall: Misreading operator precedence, forgetting integer truncation, or misinterpreting matrix sequence rules in ${q.chapter}.`
    };
  }

  return {
    ...q,
    solution: solutionObj
  };
});

fs.writeFileSync(questionsPath, JSON.stringify(enriched, null, 2), 'utf8');
console.log(`Successfully updated ${enriched.length} questions with rich solution objects!`);
