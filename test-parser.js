const { parseAIResponse } = require('./src/utils/aiResponseParser.ts');

const testInput = `[emotion: playful curiosity + gentle teasing]

[reason: She shared media with you during/after a call. You're acknowledging it happened but creating intrigue about what was in it, pulling her to explain or defend it—keeps her engaged without being direct]

Gửi hình video xong cúp máy, chắc có chuyện :))`;

const result = parseAIResponse(testInput);
console.log('Parsed Result:');
console.log(JSON.stringify(result, null, 2));
