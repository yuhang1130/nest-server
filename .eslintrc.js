module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: "es2019",
  },
  plugins: ['@darraghor/nestjs-typed'],
  extends: ['plugin:@darraghor/nestjs-typed/recommended'],
  root: true,
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // 禁止使用 any 类型
    '@typescript-eslint/no-var-requires': 0, // 禁止使用 var 来声明变量
    '@darraghor/nestjs-typed/api-method-should-specify-api-response': 0,
    '@darraghor/nestjs-typed/should-specify-forbid-unknown-values': 0,
    '@darraghor/nestjs-typed/controllers-should-supply-api-tags': 0,

    'no-console': "warn", // 禁止使用 console
    'no-unused-vars': 0, // 未使用的变量会发出警告
    'no-undef': 2, // 未定义的变量会发出错误 0 = off, 1 = warn, 2 = error
    'eqeqeq': ['warn', 'always'], // 要求使用 === 和 !==
    'quotes': ['error', 'double'], // 要求使用单引号
    'indent': ['warn', 2], // 缩进使用 2 个空格
    'semi': ['error', 'always'], // 要求语句末尾使用分号
    'brace-style': ['error', '1tbs'], // 要求使用一致的大括号风格
    'array-bracket-spacing': ['error', 'never'], // 禁止在数组括号内使用空格
    'object-curly-spacing': ['error', 'always'], // 要求在对象的属性中使用空格
    'max-len': ['warn', { 'code': 150 }], // 限制行的最大长度为 80 个字符
  },
};
