

export default class Goboard {
  clientColor: number;
  whoFirst: number;
  options: any;
  
  constructor(cfg: any) {

		Object.assign(this, {

			initialized: false,

			//是否在分支变化图上
			branch: false,
			//分支起始步数
			branchStep: 0,
			//变化图步数
			branchOrders: {},
			//sgf中默认添加的棋子数
			addedStoneNum: 0,
			//当前棋子 key：col,row value:Piece
			pieces: {},
			//目
			places: {},
			//字母标记
			markers: {},
			//历史踪迹 ，数据模型。"列行色"用逗号分隔，eg."4,3,0"
			trace: [],

			currentColor: 1,

			whoFirst: 1,

			BLACK: 1,
			WHITE: 2,

			// 落子，标记 [null, 'marker']
			clickStatus: null,

			currentMarker: null,

			// 课堂移动端键盘输入，会导致布局重新计算
			resizeLock: false,

			//show dummy
			myTurn: true,

			options: {
				// aigame, class, history
				// type: '',

				boardSize: 19,

				readonly: false,
				// 显示手数
				// showOrder: false,
				// 显示坐标
				// showCoordinates: false,
				//落子辅助线
				// showHelperLines: false,
				// 落子确认
				// playConfirm: false,
				// 音效
				// sound: true,

				resizable: true,
				// 是否是启蒙课堂（启蒙默认不展示手数，分支也不展示）
				// isKid: false,

			}
		})

		this.clientColor = this.options.clientColor || 1;
		this.whoFirst = this.options.whoFirst;

		this.init();
	}

  init () {


		// this.initEvents();

		// this.setReadonly(this.options.readonly);
	}

}