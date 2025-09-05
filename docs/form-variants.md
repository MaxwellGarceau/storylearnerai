# Form Component Variants

This document describes the new cva/cn variants added to form components, following the shadcn/ui pattern. These variants unify styling and allow consistent customization.

## FieldWrapper

- Component: `src/components/ui/form/FieldWrapper.tsx`
- Variants:
  - `size`: `sm | md | lg` (default: `md`)
- Base: `space-y-2`
- Usage example:

```tsx
<FieldWrapper id='email' label='form.email' size='lg'>
  <input id='email' />
</FieldWrapper>
```

## TextField

- Component: `src/components/ui/form/TextField.tsx`
- Variants:
  - `state`: `default | error` (default: `default`)
  - `size`: `sm | md | lg` (default: `md`)
- Base: `w-full p-2 border rounded-md`
- Error handling: passing `error` prop automatically applies `state="error"`.
- Usage example:

```tsx
<TextField
  id='name'
  label='form.name'
  value={name}
  onChange={setName}
  size='sm'
/>
```

## TextareaField

- Component: `src/components/ui/form/TextareaField.tsx`
- Variants:
  - `state`: `default | error` (default: `default`)
  - `size`: `sm | md | lg` (default: `md`)
- Base: `w-full p-2 border rounded-md resize-none`
- Error handling: passing `error` prop automatically applies `state="error"`.
- Usage example:

```tsx
<TextareaField
  id='bio'
  label='form.bio'
  value={bio}
  onChange={setBio}
  size='lg'
  rows={5}
/>
```

## SelectField

- Component: `src/components/ui/form/SelectField.tsx`
- Variants:
  - `state`: `default | error` (default: `default`)
  - `size`: `sm | md | lg` (default: `md`)
- Base: `w-full p-2 text-sm border rounded-md`
- Error handling: passing `error` prop automatically applies `state="error"`.
- Usage example:

```tsx
<SelectField
  id='level'
  label='form.level'
  value={level}
  onChange={setLevel}
  size='md'
>
  <option value='a1'>A1</option>
  <option value='a2'>A2</option>
</SelectField>
```

## FormActions

- Component: `src/components/ui/form/FormActions.tsx`
- Variants:
  - `align`: `start | center | end | between` (default: `end`)
  - `padded`: `true | false` (default: `true`)
- Base: `flex justify-end space-x-2 pt-4 p-6` (note: `padded=false` reduces spacing)
- Usage example:

```tsx
<FormActions
  onCancel={onCancel}
  onSubmit={onSubmit}
  align='between'
  padded={false}
/>
```

## Notes

- All components accept `className` for additional overrides; classes are merged via `cn` (tailwind-merge aware).
- Passing `error` keeps the existing label/error rendering and also sets error styles via the `state` variant.
- These variants are additive and backward-compatible; existing usages without variant props will render the same styles as before.
