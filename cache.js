let _data = null;
let _timestamp = null;

module.exports = {
  set(data) {
    _data = data;
    _timestamp = new Date().toISOString();
  },
  get() {
    return { data: _data, timestamp: _timestamp };
  },
  hasData() {
    return _data !== null;
  },
};
