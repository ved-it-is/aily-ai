import fs from 'node:fs';

// Keep authored lessons in one place so regeneration preserves editorial fixes.
const course = JSON.parse(fs.readFileSync('data/course.json', 'utf8'));
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/course.json', JSON.stringify(course, null, 2) + '\n');
console.log(`Generated ${course.chapters.length} chapters from data/course.json.`);
