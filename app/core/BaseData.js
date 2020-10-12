class BaseService {
    constructor(record, recordName) {
        this._record = record;
        this._recordName = recordName;
        this._driver = null;
        this._driver = null;
    }

    async getDriver() {
        if (!this._driver) {
            this._driver = this._record.getRecord(this._recordName);
            await this._driver.whenReady();
        }

        return this._driver;
    }

    async getData(dataPath) {
        const driver = await this.getDriver();
        const data = driver.get(dataPath);
        return data;
    }

    async setData(dataPath, value) {
        const driver = await this.getDriver();
        driver.set(dataPath, value);
        return value;
    }

    async dispose(roomId) {
        // TODO delete current game session state
    }
}

module.exports = BaseService;
