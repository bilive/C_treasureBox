"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importStar(require("../../plugin"));
class TreasureBox extends plugin_1.default {
    constructor() {
        super();
        this.name = '宝箱道具';
        this.description = '领取宝箱道具';
        this.version = '0.0.1';
        this.author = 'lzghzr';
        this._treasureBoxList = new Map();
    }
    async load({ defaultOptions, whiteList }) {
        defaultOptions.newUserData['treasureBox'] = false;
        defaultOptions.info['treasureBox'] = {
            description: '宝箱道具',
            tip: '领取宝箱道具',
            type: 'boolean'
        };
        whiteList.add('treasureBox');
        this.loaded = true;
    }
    async start({ users }) {
        this._treasureBox(users);
    }
    async loop({ cstMin, cstHour, cstString, users }) {
        if (cstString === '00:10')
            this._treasureBoxList.clear();
        if (cstMin === 30 && cstHour % 8 === 4)
            this._treasureBox(users);
    }
    _treasureBox(users) {
        users.forEach((user, uid) => this._treasureBoxUser(uid, user));
    }
    async _treasureBoxUser(uid, user) {
        if (this._treasureBoxList.get(uid) || !user.userData['treasureBox'])
            return;
        const current = {
            uri: `https://api.live.bilibili.com/mobile/freeSilverCurrentTask?${plugin_1.AppClient.signQueryBase(user.tokenQuery)}`,
            json: true,
            headers: user.headers
        };
        const currentTask = await plugin_1.tools.XHR(current, 'Android');
        if (currentTask !== undefined && currentTask.response.statusCode === 200) {
            if (currentTask.body.code === 0) {
                await plugin_1.tools.Sleep(currentTask.body.data.minute * 60 * 1000);
                const award = {
                    uri: `https://api.live.bilibili.com/mobile/freeSilverAward?${plugin_1.AppClient.signQueryBase(user.tokenQuery)}`,
                    json: true,
                    headers: user.headers
                };
                await plugin_1.tools.XHR(award, 'Android');
                this._treasureBoxUser(uid, user);
            }
            else if (currentTask.body.code === -10017) {
                this._treasureBoxList.set(uid, true);
                plugin_1.tools.Log(user.nickname, '宝箱道具', '已领取所有宝箱');
            }
            else
                plugin_1.tools.Log(user.nickname, '宝箱道具', currentTask.body);
        }
        else
            plugin_1.tools.Log(user.nickname, '宝箱道具', '网络错误');
    }
}
exports.default = new TreasureBox();
