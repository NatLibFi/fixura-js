/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Loading test fixtures is as easy as ABC
*
* Copyright (C) 2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of fixura-js
*
* fixura-js program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* fixura-js is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import path from 'path';
import fs from 'fs';

export const READERS = {
	TEXT: 1,
	JSON: 2,
	STREAM: 3
};

export default function ({root, reader = READERS.TEXT}) {
	return {getFixture};

	function getFixture(args) {
		const defaultReader = reader;
		const {components, readerType} = parseArgs();
		const read = getReader(readerType);

		return read(path.join.apply(undefined, root.concat(components)));

		function parseArgs() {
			if (!Array.isArray(args)) {
				const {reader, components} = args;
				return {readerType: reader ? reader : defaultReader, components};
			}

			return {components: args, readerType: defaultReader};
		}

		function getReader(context) {
			if (typeof context === 'function') {
				return context;
			}

			switch (context) {
				case READERS.TEXT:
					return readText;
				case READERS.JSON:
					return readJson;
				case READERS.STREAM:
					return readStream;
				default:
					throw new Error(`Unsupported reader type: ${context}`);
			}
		}

		function readText(filePath) {
			return fs.readFileSync(filePath, 'utf8');
		}

		function readJson(filePath) {
			const data = fs.readFileSync(filePath, 'utf8');
			return JSON.parse(data);
		}

		function readStream(filePath) {
			return fs.createReadStream(filePath);
		}
	}
}
