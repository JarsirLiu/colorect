# Ruff 代码质量检查指南

## 安装

```bash
pip install ruff==0.8.4
```

或者更新依赖：

```bash
pip install -r requirements.txt
```

## 基本使用

### 检查代码

检查所有 Python 文件：
```bash
ruff check .
```

检查特定文件或目录：
```bash
ruff check app/modules
ruff check app/main.py
```

### 自动修复

自动修复问题：
```bash
ruff check --fix .
```

### 格式化代码

格式化代码（类似 black）：
```bash
ruff format .
```

检查格式化问题但不修改：
```bash
ruff format --check .
```

## 常用命令

### 查看所有可用规则
```bash
ruff rule
```

### 查看特定规则说明
```bash
ruff rule E501
```

### 排除特定规则
```bash
ruff check --ignore E501,W503 .
```

### 只检查特定规则
```bash
ruff check --select E,F .
```

### 显示详细输出
```bash
ruff check --verbose .
```

## 配置说明

配置文件位于 `pyproject.toml`，包含：

- **line-length = 120**: 行长度限制
- **select**: 启用的规则集（错误、警告、导入排序、简化等）
- **ignore**: 忽略的规则（如 E501 行长度）
- **exclude**: 排除的文件和目录

## 集成到开发流程

### Git Pre-commit Hook

创建 `.git/hooks/pre-commit`：

```bash
#!/bin/bash
ruff check .
ruff format --check .
```

或者在项目中使用 pre-commit：

创建 `.pre-commit-config.yaml`：

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.4
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format
```

安装：
```bash
pip install pre-commit
pre-commit install
```

### VS Code 集成

安装 Ruff 扩展，然后配置 `.vscode/settings.json`：

```json
{
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": true,
      "source.organizeImports.ruff": true
    }
  },
  "ruff.lint.args": ["--config=pyproject.toml"],
  "ruff.format.args": ["--config=pyproject.toml"]
}
```

## CI/CD 集成

在 GitHub Actions 中使用：

```yaml
name: Lint
on: [push, pull_request]
jobs:
  ruff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.9"
      - run: pip install ruff==0.8.4
      - run: ruff check .
      - run: ruff format --check .
```

## 常见问题

### 1. 行长度问题 (E501)
Ruff 默认不检查行长度，如果需要检查，移除 ignore 中的 E501。

### 2. 未使用的导入
运行 `ruff check --select I --fix .` 自动清理未使用的导入。

### 3. 格式化冲突
先运行 `ruff format`，再运行 `ruff check --fix`。

## 性能优化

Ruff 使用 Rust 编写，速度非常快。对于大型项目：

```bash
# 只检查修改的文件
ruff check $(git diff --name-only --cached '*.py')

# 使用缓存
ruff check --cache .
```

## 更多资源

- [Ruff 官方文档](https://docs.astral.sh/ruff/)
- [Ruff GitHub](https://github.com/astral-sh/ruff)
- [配置规则参考](https://docs.astral.sh/ruff/rules/)
