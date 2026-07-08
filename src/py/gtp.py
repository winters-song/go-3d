import subprocess

from sgftree import SgfTree, SgfMoveNode, Color

'''
katago gtp -model /usr/local/Cellar/katago/1.15.3/share/katago/g170-b30c320x2-s4824661760-d1229536699.bin.gz -config /usr/local/Cellar/katago/1.15.3/share/katago/configs/gtp_example.cfg

命令列表： https://www.gnu.org/software/gnugo/gnugo_19.html#SEC200
name
version
known_command
list_commands
quit
boardsize
rectangular_boardsize
clear_board
set_position
komi
get_komi
play
undo
kata-get-rules
kata-set-rule
kata-set-rules
kata-get-models
kata-get-param
kata-set-param
kata-list-params
kgs-rules
genmove
kata-search
kata-search_cancellable
genmove_debug
kata-search_debug
clear_cache
showboard
fixed_handicap
place_free_handicap
set_free_handicap
time_settings
kgs-time_settings
time_left
kata-list_time_settings
kata-time_settings
final_score
final_status_list
loadsgf
printsgf
lz-genmove_analyze
kata-genmove_analyze
kata-search_analyze
kata-search_analyze_cancellable
lz-analyze
kata-analyze
kata-raw-nn
kata-raw-human-nn
cputime
gomill-cpu_time
kata-benchmark
kata-debug-print-tc
debug_moves
stop
---
showboard: X-黑棋， O-白棋

'''

def create_katago_process():
    return subprocess.Popen(
        ["katago", "gtp", "-model",
         "/usr/local/Cellar/katago/1.15.3/share/katago/g170-b30c320x2-s4824661760-d1229536699.bin.gz", "-config",
         "/usr/local/Cellar/katago/1.15.3/share/katago/configs/gtp_example.cfg"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8"
    )


def destroy_katago_process(katago_process):
    katago_process.stdin.close()
    katago_process.stdout.close()
    katago_process.stderr.close()
    katago_process.terminate()
    katago_process.wait()


def get_commands_from_sgf(sgf_str: str):
    sgf_tree = SgfTree(sgf_str)

    board_size = int(sgf_tree.root.get_property("SZ")[0])
    komi = sgf_tree.root.get_property("KM")[0] or '7.5'

    commands = [
        f"boardsize {board_size}",
        f"komi {komi}"
        "clear_board",
    ]

    def callback(node):
        if isinstance(node, SgfMoveNode):
            color_name = SgfTree.from_int(node.color)
            coords = SgfTree.index_to_coords(board_size, node.col, node.row)
            command = f"play {color_name} {coords}"
            commands.append(command)

    sgf_tree.walk_trunk(callback)
    return commands


# 发送命令并同步读取响应
def send_command(katago_process, command):
    katago_process.stdin.write(command + "\n")
    katago_process.stdin.flush()  # 确保命令被发送
    response = []  # 读取响应
    # error_output = katago_process.stderr.readline().strip()  # 读取错误输出
    # if error_output:
    #     print("KataGo Error:", error_output)

    while True:
        line = katago_process.stdout.readline().strip()
        if line == "":
            break
        response.append(line)
        # print(f"Received from KataGo: {line}")
    output = '\n'.join(response)
    # print(f"KataGo Response: \n {output}\n")

    return output

