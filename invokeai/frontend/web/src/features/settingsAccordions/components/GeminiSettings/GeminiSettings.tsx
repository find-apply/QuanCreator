import { Combobox, Flex, FormControl, FormLabel } from '@invoke-ai/ui-library';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { InformationalPopover } from 'common/components/InformationalPopover/InformationalPopover';
import {
    selectGeminiPersonGeneration,
    setGeminiPersonGeneration,
} from 'features/controlLayers/store/paramsSlice';
import type { ParameterGeminiPersonGeneration } from 'features/parameters/types/parameterSchemas';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const selectGeminiSettings = createSelector(selectGeminiPersonGeneration, (personGeneration) => ({
    personGeneration,
}));

const PERSON_GENERATION_OPTIONS: ParameterGeminiPersonGeneration[] = ['dont_allow', 'allow_adult', 'allow_all'];

const GeminiSettings = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { personGeneration } = useAppSelector(selectGeminiSettings);

    const onChangePersonGeneration = useCallback(
        (v: ParameterGeminiPersonGeneration | null) => {
            if (!v) {
                return;
            }
            dispatch(setGeminiPersonGeneration(v));
        },
        [dispatch]
    );

    const personGenerationOptions = useMemo(() => {
        return PERSON_GENERATION_OPTIONS.map((val) => ({ label: val, value: val }));
    }, []);

    const selectedPersonGeneration = useMemo(
        () => personGenerationOptions.find((o) => o.value === personGeneration) ?? personGenerationOptions[1],
        [personGeneration, personGenerationOptions]
    );

    return (
        <Flex direction="column" gap={4}>
            <FormControl>
                <InformationalPopover feature="geminiPersonGeneration">
                    <FormLabel>Person Generation</FormLabel>
                </InformationalPopover>
                <Combobox
                    options={personGenerationOptions}
                    value={selectedPersonGeneration}
                    onChange={(item) => onChangePersonGeneration((item?.value as ParameterGeminiPersonGeneration) ?? 'allow_adult')}
                />
            </FormControl>
        </Flex>
    );
};

export default memo(GeminiSettings);
