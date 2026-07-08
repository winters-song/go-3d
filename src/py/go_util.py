import re

from gtp import get_commands_from_sgf, send_command, create_katago_process


def coords_to_index(coords_str, board_size):
    """
    将围棋坐标字符串转换为数组索引形式。row的字符串和数字索引是颠倒的：A1 -> 0,18

    参数:
        coords_str (str): 位置坐标字符串，如"A1"
        board_size (int): 棋盘的尺寸，如19

    返回:
        err, [col, row]
    """
    err_msg = ("错误：坐标不合法", None)

    # 使用正则表达式解析输入字符串
    match = re.match(r'^([a-zA-Z]+)(\d+)$', coords_str)
    if not match:
        return err_msg

    col_str, row_str = match.groups()

    # 检查列字母是否只有一个字符
    if len(col_str) != 1:
        return err_msg

    col = col_str.upper()  # 转换为大写处理
    row = int(row_str)

    # 验证列字母是否合法（跳过"I"）
    if col == 'I':
        return err_msg
    elif col < 'A' or (col > 'H' and col < 'J') or col > 'T':
        return err_msg

    # 计算列对应的数值（跳过"I"）
    if col <= 'H':
        col_num = ord(col) - ord('A')  # A对应0，B对应1，..., H对应7
    else:
        col_num = ord(col) - ord('J') + 8  # J对应8，K对应9，..., T对应18

    # 验证行和列是否在棋盘范围内
    if row < 1 or row > board_size:
        return err_msg

    # 转换为数组索引形式
    return None, [col_num, board_size - row]


def new_game_gtp(sgf):
    commands = get_commands_from_sgf(sgf)
    process = create_katago_process()
    for command in commands:
        send_command(process, command)
    board_str = send_command(process, 'showboard')
    board_str = format_board_str(board_str)

    return board_str


def play_gtp(sgf, color, position):
    commands = get_commands_from_sgf(sgf)
    commands.append(f'play {color} {position}')

    process = create_katago_process()
    for command in commands:
        # print(f"Sending command: {command}")
        send_command(process, command)

    new_color = 'W' if color == 'B' else 'B'
    next_move = send_command(process, f"genmove {new_color}")
    board_str = send_command(process, 'showboard')
    board_str = format_board_str(board_str)
    new_sgf = send_command(process, "printsgf")

    if next_move == '= pass':
        score = send_command(process, "final_score")
        return next_move, new_sgf, board_str, score
    else:
        return next_move, new_sgf, board_str, None


# 格式化katago的盘面信息，坐标对齐
def format_board_str(board_str: str):
    lines = board_str.split('\n')
    if lines:  # 确保列表不为空
        del lines[0]
    if len(lines) >= 1:  # 确保修改后至少有一行
        lines[0] = '   ' + lines[0]
    for i in range(len(lines)):
        line = lines[i]
        # 只处理以数字开头的行（棋盘行）
        if re.match(r'^\d+', line.strip()):
            # 将行首的数字调整格式
            modified_line = re.sub(r'^(\d+)', lambda x: ' ' + x.group(1) if len(x.group(1)) == 1 else x.group(1), line)
            modified_line = re.sub(r'([OX])(\d+)', r'\1 ', modified_line)
            lines[i] = modified_line

    output = '\n'.join(lines)
    target = "Next player"
    index = output.find(target)

    # 如果找到，清除目标行及其之后的内容
    if index != -1:
        output = output[:index]
    return output


# play_gtp('(;SZ[9]KM[7.5];B[aa];W[ba];B[ab];W[bb];B[ac];W[bc];B[ad];W[bd];B[ae];W[be];B[af];W[bf])', 'B', 'A1')

