/* charCodeAt is the best approach for binary strings */
var use_buffer = typeof Buffer !== 'undefined';
function crc32_bstr(bstr/*:string*/)/*:CRC32Type*/ {
	if(bstr.length > 32768) if(use_buffer) return crc32_buf_8(new Buffer(bstr));
	var crc = -1, L = bstr.length - 1;
	for(var i = 0; i < L;) {
		crc =  table[(crc ^ bstr.charCodeAt(i++)) & 0xFF] ^ (crc >>> 8);
		crc =  table[(crc ^ bstr.charCodeAt(i++)) & 0xFF] ^ (crc >>> 8);
	}
	if(i === L) crc = (crc >>> 8) ^ table[(crc ^ bstr.charCodeAt(i)) & 0xFF];
	return crc ^ -1;
}

function crc32_buf(buf/*:ABuf*/)/*:CRC32Type*/ {
	if(buf.length > 10000) return crc32_buf_8(buf);
	for(var crc = -1, i = 0, L=buf.length-3; i < L;) {
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
	}
	while(i < L+3) crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
	return crc ^ -1;
}

function crc32_buf_8(buf/*:ABuf*/)/*:CRC32Type*/ {
	for(var crc = -1, i = 0, L=buf.length-7; i < L;) {
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
	}
	while(i < L+7) crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
	return crc ^ -1;
}

/* much much faster to intertwine utf8 and crc */
function crc32_str(str/*:string*/)/*:CRC32Type*/ {
	for(var crc = -1, i = 0, L=str.length, c, d; i < L;) {
		c = str.charCodeAt(i++);
		if(c < 0x80) {
			crc = (crc >>> 8) ^ table[(crc ^ c) & 0xFF];
		} else if(c < 0x800) {
			crc = (crc >>> 8) ^ table[(crc ^ (192|((c>>6)&31))) & 0xFF];
			crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 0xFF];
		} else if(c >= 0xD800 && c < 0xE000) {
			c = (c&1023)+64; d = str.charCodeAt(i++) & 1023;
			crc = (crc >>> 8) ^ table[(crc ^ (240|((c>>8)&7))) & 0xFF];
			crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>2)&63))) & 0xFF];
			crc = (crc >>> 8) ^ table[(crc ^ (128|((d>>6)&15)|(c&3))) & 0xFF];
			crc = (crc >>> 8) ^ table[(crc ^ (128|(d&63))) & 0xFF];
		} else {
			crc = (crc >>> 8) ^ table[(crc ^ (224|((c>>12)&15))) & 0xFF];
			crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>6)&63))) & 0xFF];
			crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 0xFF];
		}
	}
	return crc ^ -1;
}
