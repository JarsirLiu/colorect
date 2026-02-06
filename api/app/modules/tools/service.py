"""
工具管理业务逻辑
"""
import json
import logging
from pathlib import Path
from typing import Any, Optional

from app.core.config import settings


logger = logging.getLogger(__name__)


class ToolService:
    """工具管理服务"""

    def __init__(self):
        self.tools_config_path = Path(settings.TOOLS_CONFIG_PATH)
        self._tools_cache: Optional[list[dict[str, Any]]] = None

    def load_tools(self) -> list[dict[str, Any]]:
        """
        加载所有工具配置

        Returns:
            工具配置列表
        """
        if self._tools_cache is not None:
            return self._tools_cache

        tools = []

        if not self.tools_config_path.exists():
            logger.warning(f"Tools config directory not found: {self.tools_config_path}")
            return tools

        # 扫描 tools_config 目录下的所有 JSON 配置文件
        for config_file in self.tools_config_path.glob("*.json"):
            try:
                with open(config_file, encoding='utf-8') as f:
                    config = json.load(f)
                    if config.get('enabled', True):
                        tools.append(config)
                        logger.info(f"Loaded tool: {config.get('name')} from {config_file.name}")
            except json.JSONDecodeError as e:
                logger.error(f"Error loading config {config_file.name}: {e}")
            except OSError as e:
                logger.error(f"Error reading config file {config_file.name}: {e}")

        self._tools_cache = tools
        return tools

    def get_tool_by_id(self, tool_id: str) -> Optional[dict[str, Any]]:
        """
        根据 tool_id 获取工具配置

        Args:
            tool_id: 工具ID

        Returns:
            工具配置字典，如果未找到返回 None
        """
        tools = self.load_tools()
        return next((t for t in tools if t.get('id') == tool_id), None)

    def get_tool_url(self, tool_id: str) -> Optional[str]:
        """
        获取工具后端 URL

        Args:
            tool_id: 工具ID

        Returns:
            工具后端 URL，如果未找到返回 None
        """
        tool = self.get_tool_by_id(tool_id)
        if not tool:
            return None

        # 优先使用开发环境配置
        dev_config = tool.get('development', {})
        backend_config = dev_config.get('backend', {})
        backend_url = backend_config.get('entry')

        if not backend_url:
            # 尝试从 production 获取
            prod_config = tool.get('production', {})
            backend_config = prod_config.get('backend', {})
            backend_url = backend_config.get('entry')

        return backend_url

    def clear_cache(self):
        """清除缓存"""
        self._tools_cache = None


# 全局服务实例
tool_service = ToolService()
