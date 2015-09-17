class BitPacker {

  /**
   * Creates the object
   */
  constructor(){
    // Since this class does a bunch of bit-manipulation, we need to heck endianess first
    this._isLittleEndian = this._checkIsLittleEndian();
  }

  /**
   * Packs an RGBA value to a 32bit int.
   * This function is either-endian safe
   *
   * Note: Bounds are not checked for any of the values!
   *
   * @param  {int}  red     0-255
   * @param  {int}  green   0-255
   * @param  {int}  blue    0-255
   * @param  {int}  alpha   0-255
   * @return {int}          uint32 packed pixel color
   */
  packPixel(red, green, blue, alpha) {
    if (this._isLittleEndian) {
      return (alpha << 24) | (blue << 16) | (green << 8) | red;
    } else {
      return (red << 24) | (green << 16) | (blue << 8) | alpha;
    }
  }

  /**
   * Packs an RGBA value to a 32bit int.
   * This function is either-endian safe
   *
   * Note: Bounds are not checked for any of the values!
   *
   * @param  {int}   packedPixel uint32 packed pixel color value
   * @return {array}             [red,green,blue,alpha] array of 0-255 each
   */
  unpackPixel(packedPixel){
    if (this._isLittleEndian) {
      return [
        (packedPixel & 0x000000ff),
        (packedPixel & 0x0000ff00) >>> 8,
        (packedPixel & 0x00ff0000) >>> 16,
        (packedPixel & 0xff000000) >>> 24
      ];
    } else {
      return [
        (packedPixel & 0xff000000) >>> 24,
        (packedPixel & 0x00ff0000) >>> 16,
        (packedPixel & 0x0000ff00) >>> 8,
        (packedPixel & 0x000000ff)
      ];
    }
  }

  /**
   * Checks if the system is little or big endian
   * @return {Boolean} True if little endian, false if big endian
   */
  _checkIsLittleEndian() {
    let buffer = new ArrayBuffer(12);
    let uInt32Array = new Uint32Array(buffer);

    uInt32Array[1] = 0x0a0b0c0d;

    if (buffer[4] === 0x0a && buffer[5] === 0x0b && buffer[6] === 0x0c && buffer[7] === 0x0d) {
      return false;
    } else {
      return true;
    }
  }
}
