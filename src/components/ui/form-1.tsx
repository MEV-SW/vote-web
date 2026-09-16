import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

/** Reference settings form layout (21st.dev form-1) */
export default function FormLayout02() {
  return (
    <div className="flex items-center justify-center p-10">
      <form className="w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground">Personal information</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full sm:col-span-3">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" name="first-name" placeholder="Emma" className="mt-2" />
              </div>
              <div className="col-span-full sm:col-span-3">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" name="last-name" placeholder="Crown" className="mt-2" />
              </div>
              <div className="col-span-full">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="emma@company.com"
                  className="mt-2"
                />
              </div>
              <div className="col-span-full sm:col-span-3">
                <Label htmlFor="birthyear">Birth year</Label>
                <Input type="number" id="birthyear" name="year" placeholder="1990" className="mt-2" />
              </div>
              <div className="col-span-full sm:col-span-3">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" placeholder="Senior Manager" disabled className="mt-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Roles can only be changed by system admin.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground">Workspace settings</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full sm:col-span-3">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <Input
                  id="workspace-name"
                  name="workspace-name"
                  placeholder="Test workspace"
                  className="mt-2"
                />
              </div>
              <div className="col-span-full sm:col-span-3">
                <Label htmlFor="visibility">Visibility</Label>
                <Select name="visibility" defaultValue="private">
                  <SelectTrigger id="visibility" className="mt-2 w-full">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-full">
                <Label htmlFor="workspace-description">Workspace description</Label>
                <Textarea id="workspace-description" name="workspace-description" className="mt-2" rows={4} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Note: description provided will not be displayed externally.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground">Notification settings</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <fieldset>
              <legend className="text-sm font-medium text-foreground">Newsletter</legend>
              <p id="newsletter-description" className="mt-2 text-sm leading-6 text-muted-foreground">
                Change how often you want to receive updates from our newsletter.
              </p>
              <RadioGroup defaultValue="never" className="mt-6">
                <div className="flex items-center gap-x-3">
                  <RadioGroupItem id="every-week" value="every-week" aria-describedby="newsletter-description" />
                  <Label htmlFor="every-week">Every week</Label>
                </div>
                <div className="flex items-center gap-x-3">
                  <RadioGroupItem id="every-month" value="every-month" aria-describedby="newsletter-description" />
                  <Label htmlFor="every-month">Every month</Label>
                </div>
                <div className="flex items-center gap-x-3">
                  <RadioGroupItem id="never" value="never" aria-describedby="newsletter-description" />
                  <Label htmlFor="never">Never</Label>
                </div>
              </RadioGroup>
            </fieldset>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline">
            Go back
          </Button>
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </div>
  );
}
