const fs = require('fs');

const content = fs.readFileSync('src/features/loanOrderMobiles/components/loanOrderMobileForm.tsx', 'utf8');

let newContent = content.replace(
  /{[\s\S]*?\/\* ── Status ──[\s\S]*?}/, 
  `      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {mode === 'create'
            ? (t('Loan order create') || 'Karz sargyt döredüň')
            : (t('Loan order edit')   || 'Karz sargydy üýtget')}
        </h1>
      </div>

      <div className="py-2 mb-2">
        <StepBarCards steps={stepItems} onGoTo={setCurrentStep} />
      </div>

      <div className={cn('flex flex-col gap-5', currentStep !== 0 && 'hidden')}>
      {/* ── Status ──`
);

newContent = newContent.replace(
  /{\/\* ── Personal Data ──/,
  `      </div>
      <div className={cn('flex flex-col gap-5', currentStep !== 1 && 'hidden')}>
      {/* ── Personal Data ──`
);

newContent = newContent.replace(
  /{\/\* ── Job ──/,
  `      </div>
      <div className={cn('flex flex-col gap-5', currentStep !== 2 && 'hidden')}>
      {/* ── Job ──`
);

newContent = newContent.replace(
  /{\/\* ── Card ──/,
  `      </div>
      <div className={cn('flex flex-col gap-5', currentStep !== 3 && 'hidden')}>
      {/* ── Card ──`
);

newContent = newContent.replace(
  /{\/\* ── Passport ──/,
  `      </div>
      <div className={cn('flex flex-col gap-5', currentStep !== 4 && 'hidden')}>
      {/* ── Passport ──`
);

newContent = newContent.replace(
  /{\/\* ── Zamun ──/,
  `      </div>
      <div className={cn('flex flex-col gap-5', currentStep !== 5 && 'hidden')}>
      {/* ── Zamun ──`
);

newContent = newContent.replace(
  /      <FormActions[\s\S]*?\/>\n    <\/div>/,
  `      </div>
      
      <FormActions
        isPending={isPending}
        onSubmit={currentStep === stepItems.length - 1 ? handleSubmit : undefined}
        onNext={currentStep < stepItems.length - 1 ? handleNext : undefined}
        onPrev={currentStep > 0 ? handlePrev : undefined}
        onCancel={() => navigate(-1)}
        cancelLabel={t('Cancel') || 'Ýatyr'}
        loadingLabel={t('Loading') || 'Ýüklenilýär...'}
        submitLabel={mode === 'create'
          ? (t('loanOrderMobiles.createButton') || 'Karz sargyt döredüň')
          : (t('loanOrders.saveButton') || 'Ýatda sakla')}
        showSubmit={currentStep === stepItems.length - 1}
      />
    </div>`
);

fs.writeFileSync('src/features/loanOrderMobiles/components/loanOrderMobileForm.tsx', newContent);
console.log('Done rewriting JSX!');
