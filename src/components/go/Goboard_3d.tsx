

export default class Goboard_3d {
  clientColor = 1;
	currentColor = 1
  whoFirst = 1;
	//当前棋子 key：col,row value:Piece
	pieces: number[] = [];

	initialized = false;

	//是否在分支变化图上
	branch = false;
	//分支起始步数
	branchStep = 0;
	//变化图步数
	branchOrders = {};
	//sgf中默认添加的棋子数
	addedStoneNum = 0
	
	//步数
	orders = {}
	//坐标
	coordinates = {}
	//目
	places = {}
	//字母标记
	markers = {}
	// multigo 分支字母
	branchMarkers = {}
	//投票
	votes = {}
	//历史踪迹 ，数据模型。"列行色"用逗号分隔，eg."4,3,0"
	trace: string[] = []

	// 落子，标记 [null, 'marker']
	clickStatus = ''
	currentMarker = ''

	// 当前可落子，展示虚影
	myTurn = true;

	options = {
		clientColor: 1,
		whoFirst: 1,
		// aigame, class, history
		type: '',

		boardSize: 19,
		readonly: false,
		// 显示手数
		// showOrder: false,
		// 显示坐标
		// showCoordinates: false,
		//落子辅助线
		showHelperLines: false,
		// 落子确认
		playConfirm: false,
		// 音效
		sound: true,
	};

	head: any = null;

	onMarkCb = ( currentMarker: string, col:number, row:number) => {}
	onPlayCb = ( color: number, col:number, row:number) => {}
	onSetHeadCb = (params: { col: number, row: number } | null) => {}
  
  constructor(cfg: any) {

		Object.assign(this.options, cfg);

		this.clientColor = this.options.clientColor || 1;
		this.whoFirst = this.options.whoFirst;

		this.init();
	}

  init () {
		this.pieces = new Array(this.options.boardSize * this.options.boardSize).fill(0);
		this.setReadonly(this.options.readonly);
	}

	setReadonly (b: boolean){
		this.options.readonly = b;

		if(b){
			// this.dummy?.hide();
		}else{
			// this.helperShowed = false;
		}
	}


	printBoard () {
		const boardSize = this.options.boardSize;
		const rows = [];

		for (let y = 0; y < boardSize; y++) {
			let row = '';
			for (let x = 0; x < boardSize; x++) {
				const index = y * boardSize + x;
				const stone = this.pieces[index];

				if (stone === 0) row += '. ';
				else if (stone === 1) row += 'X ';
				else if (stone === 2) row += 'O ';
			}
			rows.push(row.trim());
		}

		console.log(rows.join('\n'));
	}

	oppositeColor (color: number) {
		return 3 - color;
	}

	isReadonly (){
		return this.options.readonly;
	}

	add (color: number, col: number, row: number, silent: boolean) {
		const key = row * this.options.boardSize + col

		//push to history
		this.trace.push(`${key},${color}`);

		if( col > this.options.boardSize || row > this.options.boardSize){
			return false;
		}
		if(this.pieces[key]) {
			return false;
		}
		// not pass
		if(19 !== col && 19 !== row) {

			this.addPiece(key, color);

			if(!silent){
				// 最后一手棋标志
				this.showHead();
			}
		}

		// this.currentColor = this.oppositeColor(color);

		// if(!this.isReadonly()){
		// 	this.updateDummyColor();
		// }
		return true;
	}

	addPiece (key: number, color:number, order?:number, isRecover?: boolean) {
		this.pieces[key] = color;
	}

	setClientColor (color: number) {
		this.clientColor = color;
	}

	setCurrentColor (color?: number) {
		if(color){
			this.currentColor = color;
		}else if(this.trace.length){
			// this.currentColor = 1 + this.trace.length%2;
			let last = this.trace[this.trace.length -1];
			let arr = last.split(',');
			// 最后一子是添加的
			if(arr[2]=== '1'){
				this.currentColor = this.whoFirst;
			}else{
				this.currentColor = arr[1] === '2' ? 1 : 2;
			}
		}else {
			this.currentColor = this.whoFirst;
		}
	}

	eat (keys: number[]) {
		for(let i = 0 ;i < keys.length;i++){
			this.removePiece(keys[i]);
		}
	}

	removePiece (key: number) {
		this.pieces[key] = 0;
	}

	clearBoard () {
		this.pieces = new Array(this.options.boardSize * this.options.boardSize).fill(0);
		this.hideHead();
	}

	shoot (col: number, row: number) {

		if(this.clickStatus === 'marker'){
			this.onMarkCb.call(this, this.currentMarker, col, row);
		} else {
			this.onPlayCb.call(this, this.currentColor, col, row);
		}
	}

	onMark (cb: any) {
		this.onMarkCb = cb;
		return this;
	}

	onPlay (cb: any) {
		this.onPlayCb = cb;
		return this;
	}

	onSetHead (cb: any) {
		this.onSetHeadCb = cb;
		return this;
	}

	showHelperLine(col:number, row:number) {
	}

	hideHelperLine() {
	}

	showLastOrder() {
	}

	showOrder() {
	}

	showHead () {
		let vertex = this.getLastMove();

		// 当前是落子，非pass时展示三角
		if(vertex !== undefined){
			this.onSetHeadCb.call(this, vertex);
		}else{
			this.onSetHeadCb.call(this, null);
		}
	}

	hideHead () {
		this.onSetHeadCb.call(this, null);
	}

	getLastMove () {
		//获取最后一个棋子
		if(!this.trace || this.trace.length<=0){
			return;
		}
		let last = this.trace.length-1;
		if(last < 0){
			return
		}

		let index = parseInt(this.trace[last].split(',')[0]);

		if(index === 19 * 19){
			if(last < 1){
				return;
			}
		}
		return {
			col: index % this.options.boardSize,
			row: Math.floor(index / this.options.boardSize)
		};
	}

	recoverPiece (col:number, row:number, color:number){
		//校验，复原的棋子是否在历史中存在，通过倒序查找获得被吃子的序号
		let m, key,i;
		const index = row * this.options.boardSize + col;

		for(i = this.trace.length-1;i>=0 ;i--){
			// indexOf '15,1' -> '15,18','15,17'...
			// indexOf '15,1,' -> '15,1,'
			if(0 === this.trace[i].indexOf(index + ',')) {
				m = this.trace[i];
				break;
			}
		}

		if(!m){
			//puzzle
			this.removePiece(index);
			this.addPiece(index, color, -1);
		} else{
			let parts = m.split(',');
			color = parseInt(parts[2]);
			key = parts[0]+','+parts[1];

			this.removePiece(index);
			this.addPiece(index, color, i + 1 - this.addedStoneNum, true);
		}

	}

}