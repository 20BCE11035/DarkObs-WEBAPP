'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const ResetPasswordValidator = z.object({
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long.',
  }),
})

type TResetPasswordValidator = z.infer<typeof ResetPasswordValidator>

const ResetPasswordPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TResetPasswordValidator>({
    resolver: zodResolver(ResetPasswordValidator),
  })

  const { mutate, isLoading } = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success('Password reset successfully')
      router.push('/sign-in')
    },
    onError: (err) => {
      toast.error('Invalid or expired token')
    },
  })

  const onSubmit = ({ password }: TResetPasswordValidator) => {
    if (!token) {
      toast.error('Invalid reset link')
      return
    }
    mutate({ token, password })
  }

  return (
    <div className='container relative flex pt-20 pb-20 flex-col items-center justify-center lg:px-0'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col items-center space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking  tracking-tight'>
            Reset Your Password
          </h1>
          <p className='text-sm text-muted-foreground'>
            Enter your new password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <div className='grid gap-1 py-2'>
              <Label htmlFor='password'>New Password</Label>
              <Input
                {...register('password')}
                type='password'
                placeholder='New Password'
              />
              {errors?.password && (
                <p className='text-sm text-red-500'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button disabled={isLoading}>
              {isLoading && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage