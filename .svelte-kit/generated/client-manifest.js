export { matchers } from './client-matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2')
];

export const dictionary = {
	"": [[1], [0], 2]
};