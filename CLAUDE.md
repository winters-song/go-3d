# 终端执行规范

所有node/yarn/npm/pnpm脚本执行前：

1. 执行 nvm use 20
2. 再执行目标包管理命令
   禁止直接运行 yarn/npm，必须前置版本切换
   示例完整命令模板：
   nvm use 20 && yarn install 2>&1 | tail -5
