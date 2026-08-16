# Coding Rules

## Ngôn ngữ & Cú pháp

- Code phải viết theo chuẩn **ES7** (ECMAScript 2016) trở lên, sử dụng các tính năng hiện đại: `async/await`, spread/rest operator, destructuring, template literals, optional chaining, nullish coalescing.

## Hàm (Functions)

- **Bắt buộc dùng arrow function** `() => {}` cho tất cả hàm (kể cả hàm callback, hàm trong object, hàm truyền vào component).
- Cấm dùng `function` keyword trừ khi bất khả kháng (ví dụ: cần hoist hoặc `this` binding riêng).
- Arrow function không có body phức tạp thì dùng dạng ngắn gọn: `const fn = () => value`.

### Ví dụ

```ts
// Đúng
const handleClick = () => {
  console.log('clicked');
};

const doubled = items.map((item) => item * 2);

useEffect(() => {
  fetchData();
}, []);

// Sai
function handleClick() {
  console.log('clicked');
}

items.map(function (item) {
  return item * 2;
});
```

## Bất biến (Immutable)

- Không gán lại biến đã khai báo với `let` khi có thể dùng `const`.

## UI Components & Shadcn UI

- **Ưu tiên sử dụng Shadcn UI & Tiptap UI Primitives**: Tận dụng tối đa các UI component có sẵn từ **shadcn/ui** (Button, Dialog/Modal, Dropdown Menu, Tooltip, Popover, Input, Switch, Tabs, Card, v.v.) để đẩy nhanh tiến độ phát triển, đảm bảo tính thẩm mỹ, đồng bộ và chuẩn accessibility (a11y).
- **Hạn chế viết lại từ đầu**: Tránh tự code lại các component UI phức tạp từ HTML/CSS thuần khi đã có component tương đương từ shadcn/ui hoặc thư viện UI primitives của dự án.
- **Tùy biến linh hoạt**: Tùy biến style component qua `className`, `cva` (Class Variance Authority), Tailwind/SCSS tokens mà vẫn giữ nguyên cấu trúc chuẩn và headless logic.
