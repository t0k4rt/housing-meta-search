/**
 * Created by alexandre on 13/03/15.
 */
class BaseModel {
  constructor() {
    this.new = true;
    this.attributes = {};
  }

  setKey(key, value) {
    if (key) {
      this.attributes[key] = value;
    }
  }

  getKey(key) {
    return this.attributes[key];
  }
}


