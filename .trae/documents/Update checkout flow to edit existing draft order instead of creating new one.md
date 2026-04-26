**任务目标：**
修改“编辑草稿”的后续流程，确保用户在编辑草稿并支付后，是**更新原有的草稿订单**，而不是生成一个新的订单（导致旧草稿依然存在）。

**核心问题：**
当前的 `checkout` 接口（`/api/events/checkout`）逻辑是每次请求都生成一个新的 `orderNo` 并创建新订单，完全忽略了是否是在“编辑”一个已存在的草稿。

**实施计划：**

1.  **修改前端 - 保存草稿 ID**
    *   **文件**：`src/app/[locale]/(organizer)/my-events/create/page.tsx`
    *   **操作**：在点击“Update & Continue”提交表单时，将当前 URL 中的 `draftId` 一并保存到 `sessionStorage` 的 `event_draft` 数据中。这样后续的确认页面就能知道这是一个待更新的草稿。

2.  **修改前端 - 传递草稿 ID**
    *   **文件**：`src/app/[locale]/(organizer)/my-events/create/confirm/page.tsx`
    *   **操作**：在点击“Proceed to Payment”时，从 `sessionStorage` 读取数据。如果包含 `draftId`，则将其作为参数传给后端 `checkout` 接口。

3.  **修改后端 - 支持更新订单**
    *   **文件**：`src/app/api/events/checkout/route.ts`
    *   **操作**：
        *   接收请求体中的 `draftId` 参数。
        *   **如果存在 `draftId`**：
            *   验证该订单是否存在且属于当前用户。
            *   **复用**该订单的 `orderNo`。
            *   **更新**数据库中该订单的 `description`（活动详情）、`amount`（金额，如果活动类型变了）等字段。
            *   **跳过** `createOrder` 步骤（因为订单已存在）。
            *   使用更新后的信息调用支付提供商（Stripe等）创建新的支付会话。
        *   **如果不存在 `draftId`**：
            *   保持原有逻辑（生成新 ID，创建新订单）。

**预期结果：**
用户编辑草稿 -> 支付成功 -> 原草稿订单状态变为“已支付” -> 列表中只显示一个已完成的活动，不会残留旧的草稿记录。
