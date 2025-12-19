module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    // Обрабатываем .ts и .js файлы через ts-jest
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",

  // !!! ВАЖНОЕ ИЗМЕНЕНИЕ НИЖЕ !!!
  // По умолчанию Jest игнорирует всё в node_modules.
  // Мы говорим: "Игнорируй всё, КРОМЕ пакетов langchain, docling, p-retry и т.д."
  transformIgnorePatterns: [
    "/node_modules/(?!(@langchain|langchain|@docling|docling-sdk|p-retry|is-network-error|uuid|p-queue|p-timeout)/)",
  ],
  setupFiles: ["<rootDir>/../jest.setup.js"],
};
