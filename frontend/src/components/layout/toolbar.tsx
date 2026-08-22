'use client'

import { ArrowUpDownIcon, LayersIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

type ToolbarProps = {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  groupOptions?: string[]
  group?: string
  onGroupChange?: (value: string) => void
  sortOptions?: string[]
  sort?: string
  onSortChange?: (value: string) => void
  filters?: string[]
  activeFilters?: string[]
  onToggleFilter?: (value: string) => void
  children?: React.ReactNode
}

export function Toolbar({
  placeholder = 'Search…',
  value,
  onValueChange,
  groupOptions = [],
  group,
  onGroupChange,
  sortOptions = [],
  sort,
  onSortChange,
  filters = [],
  activeFilters = [],
  onToggleFilter,
  children,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="min-w-0 flex-1 basis-56">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={placeholder}
          value={value}
          aria-label={placeholder}
          onChange={(e) => onValueChange?.(e.target.value)}
        />
      </InputGroup>

      {groupOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <LayersIcon data-icon="inline-start" />
            {group && group !== 'None' ? `Group: ${group}` : 'Group by'}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Group by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={group} onValueChange={(v) => onGroupChange?.(v as string)}>
              {groupOptions.map((o) => (
                <DropdownMenuRadioItem key={o} value={o}>
                  {o}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {filters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <SlidersHorizontalIcon data-icon="inline-start" />
            Filter
            {activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {filters.map((f) => (
                <DropdownMenuCheckboxItem
                  key={f}
                  checked={activeFilters.includes(f)}
                  onCheckedChange={() => onToggleFilter?.(f)}
                  closeOnClick={false}
                >
                  {f}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {sortOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <ArrowUpDownIcon data-icon="inline-start" />
            {sort ? `Sort: ${sort}` : 'Sort by'}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sort} onValueChange={(v) => onSortChange?.(v as string)}>
              {sortOptions.map((o) => (
                <DropdownMenuRadioItem key={o} value={o}>
                  {o}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {children}
    </div>
  )
}
