// Устанавливаем фейковые значения для обязательных переменных
process.env.DBNAME = "test_db"; // Тот самый, на который ругается тест
process.env.DBHOST = "localhost";
process.env.DBUSER = "test_user";
process.env.DBPASSWORD = "test_pass";
process.env.DBPORT = "5432";
process.env.DBSCHEMA = "test_schema";

process.env.PORT = "4444";
process.env.NODE_ENV = "test";
// Другие переменные, которые могут проверяться в вашем конфиге
process.env.OLLAMA_BASE_URL = "http://localhost:11434";
process.env.OLLAMA_EMBEDDING_MODEL = "model";
process.env.DOCLING_URL = "http://localhost:5001";
process.env.AUTH_SERVER_URL = "http://localhost:4444";
process.env.INPUT_FILE_PATH = "./input_test";
process.env.DOCLING_API_KEY = "fake";
