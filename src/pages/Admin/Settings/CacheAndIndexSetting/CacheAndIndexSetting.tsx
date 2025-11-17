import { getCacheAndIndexConfig, rebuildIndex, updateCacheAndIndexConfig } from '@/services/adminService';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { FiAlertCircle, FiDatabase, FiFolder, FiHardDrive, FiRefreshCw, FiSearch, FiZap } from 'react-icons/fi';
import { DEFAULT_VALUES } from '@/constants';
import './CacheAndIndexSetting.scss';

// 缓存和索引表单数据接口
interface CacheAndIndexFormData {
  aofEnabled: boolean;
  aofPath: string;
  aofMaxSize: string;
  compressEnabled: boolean;
  indexPath: string;
}

// 表单验证错误接口
interface ValidationErrors {
  [key: string]: string;
}

// 组件属性接口
interface CacheAndIndexSettingProps {
  onSaveSuccess?: () => void;
}

const CacheAndIndexSetting: React.FC<CacheAndIndexSettingProps> = memo(({ onSaveSuccess }) => {
  const [formData, setFormData] = useState<CacheAndIndexFormData>({
    aofEnabled: true,
    aofPath: DEFAULT_VALUES.AOF_PATH,
    aofMaxSize: '1',
    compressEnabled: true,
    indexPath: DEFAULT_VALUES.INDEX_PATH,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isRebuildingIndex, setIsRebuildingIndex] = useState<boolean>(false);
  const [rebuildSuccess, setRebuildSuccess] = useState<boolean>(false);

  // 加载缓存和索引配置
  useEffect(() => {
    const fetchCacheAndIndexConfig = async () => {
      try {
        setLoading(true);
        setSubmitError(null);

        const response = await getCacheAndIndexConfig();

        if (response.code === 200 && response.data) {
          const { enable_aof, aof_dir_path, aof_mix_size, aof_compress, index_path } = response.data;

          // 设置表单数据
          setFormData({
            aofEnabled: enable_aof,
            aofPath: aof_dir_path || '',
            aofMaxSize: aof_mix_size ? aof_mix_size.toString() : '1',
            compressEnabled: aof_compress,
            indexPath: index_path || '',
          });
        } else {
          // 显示后端返回的错误信息
          setSubmitError(`获取缓存和索引配置失败: ${response.msg}`);
        }
      } catch {
        setSubmitError('获取缓存和索引配置时发生错误，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchCacheAndIndexConfig();
  }, []);

  // 验证单个字段
  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'aofPath':
        // AOF路径可以为空
        return '';
      case 'aofMaxSize': {
        const size = parseFloat(value);
        if (isNaN(size) || size <= 0) {
          return 'AOF文件最大大小必须为正数';
        }
        return '';
      }
      case 'indexPath':
        // 索引路径可以为空
        return '';
      default:
        return '';
    }
  }, []);

  // 验证整个表单
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // 只有在AOF持久化启用时才验证相关字段
    if (formData.aofEnabled) {
      // 验证AOF路径和AOF最大大小
      ['aofPath', 'aofMaxSize'].forEach((field) => {
        const fieldKey = field as keyof CacheAndIndexFormData;
        const error = validateField(field, formData[fieldKey] as string);
        if (error) {
          newErrors[fieldKey] = error;
          isValid = false;
        }
      });
    }

    // 验证索引路径
    const indexError = validateField('indexPath', formData.indexPath);
    if (indexError) {
      newErrors.indexPath = indexError;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  // 处理输入变更
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 清除错误
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // 如果有成功消息，清除它
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  }, [errors, saveSuccess]);

  // 提交表单
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // 准备数据
      const enableAOF = formData.aofEnabled;
      const aofPath = formData.aofPath;
      const aofMaxSize = parseFloat(formData.aofMaxSize);
      const aofCompress = formData.compressEnabled;
      const indexPath = formData.indexPath;

      // 调用API更新缓存和索引配置
      const response = await updateCacheAndIndexConfig(
        enableAOF,
        aofPath,
        aofMaxSize,
        aofCompress,
        indexPath,
      );

      if (response.code === 200) {
        // 显示成功消息
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        // 如果有回调函数，调用它
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        // 显示后端返回的错误信息
        setSubmitError(`${response.msg}`);
      }
    } catch {
      setSubmitError('保存配置时发生错误，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSaveSuccess, validateForm]);

  // 重建索引处理函数
  const handleRebuildIndex = useCallback(async () => {
    setIsRebuildingIndex(true);
    setSubmitError(null);
    setRebuildSuccess(false);

    try {
      // 调用重建索引API
      const response = await rebuildIndex();

      if (response.code === 200) {
        // 显示重建成功消息
        setRebuildSuccess(true);
        setTimeout(() => setRebuildSuccess(false), 3000);
      } else {
        // 显示后端返回的错误信息
        setSubmitError(`重建索引失败: ${response.msg}`);
      }
    } catch {
      setSubmitError('重建索引时发生错误，请稍后再试');
    } finally {
      setIsRebuildingIndex(false);
    }
  }, []);

  // 显示加载中状态
  if (loading) {
    return (
      <div className='cache-and-index-setting-card'>
        <div className='loading-container'>
          <div className='loading-spinner'></div>
          <p>加载缓存和索引配置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='cache-and-index-setting-card'>
      <div className='cache-and-index-img-section'>
        <div className='cache-and-index-info-overlay'>
          <div className='cache-and-index-title'>
            <FiDatabase className='cache-and-index-icon' />
            <h2>缓存和索引配置</h2>
          </div>
          <div className='cache-and-index-description'>
            <p>
              在这里配置系统缓存的持久化选项和搜索索引配置，包括AOF持久化、压缩设置、文件路径和索引路径。
              合理的缓存配置可以提高系统性能并确保数据安全。
            </p>
            <p>
              AOF持久化可以记录所有的写操作，在系统重启时用于重建数据。
              启用压缩可以减少AOF文件大小，但可能会增加CPU使用率。 搜索索引配置用于全文搜索功能。
            </p>
          </div>
        </div>
      </div>

      <div className='cache-and-index-setting-form-wrapper'>
        {saveSuccess && (
          <div className='save-notification'>
            <FiAlertCircle />
            设置已保存成功！
          </div>
        )}

        {rebuildSuccess && (
          <div className='save-notification'>
            <FiAlertCircle />
            索引重建成功！
          </div>
        )}

        <form className='cache-and-index-setting-form' onSubmit={handleSubmit}>
          <div className='form-group checkbox-group'>
            <label htmlFor='aofEnabled' className='checkbox-label'>
              <input
                type='checkbox'
                id='aofEnabled'
                name='aofEnabled'
                checked={formData.aofEnabled}
                onChange={handleInputChange}
              />
              <span className='checkbox-icon'></span>
              <span className='label-text'>
                <FiDatabase className='input-icon' />
                启用AOF持久化
              </span>
            </label>
          </div>

          {formData.aofEnabled && (
            <>
              <div className='form-group'>
                <label>
                  <FiFolder className='input-icon' />
                  AOF文件目录
                </label>
                <input
                  type='text'
                  name='aofPath'
                  value={formData.aofPath}
                  onChange={handleInputChange}
                  placeholder='输入AOF文件存储目录路径（可选）'
                />
                {errors.aofPath && (
                  <span className='error-message'>
                    <FiAlertCircle />
                    {errors.aofPath}
                  </span>
                )}
              </div>

              <div className='form-group'>
                <label>
                  <FiHardDrive className='input-icon' />
                  AOF文件最大大小 (MB)
                </label>
                <input
                  type='number'
                  name='aofMaxSize'
                  value={formData.aofMaxSize}
                  onChange={handleInputChange}
                  min='0.1'
                  step='0.1'
                  placeholder='输入AOF文件最大大小'
                />
                {errors.aofMaxSize && (
                  <span className='error-message'>
                    <FiAlertCircle />
                    {errors.aofMaxSize}
                  </span>
                )}
              </div>

              <div className='form-group checkbox-group'>
                <label htmlFor='compressEnabled' className='checkbox-label'>
                  <input
                    type='checkbox'
                    id='compressEnabled'
                    name='compressEnabled'
                    checked={formData.compressEnabled}
                    onChange={handleInputChange}
                  />
                  <span className='checkbox-icon'></span>
                  <span className='label-text'>
                    <FiZap className='input-icon' />
                    启用AOF文件压缩
                  </span>
                </label>
              </div>
            </>
          )}

          <div className='form-group'>
            <label>
              <FiSearch className='input-icon' />
              搜索索引文件路径
            </label>
            <div className='input-group'>
              <input
                type='text'
                name='indexPath'
                value={formData.indexPath}
                onChange={handleInputChange}
                placeholder='输入搜索索引文件路径（可选）'
                className='input-with-button'
              />
              <button
                type='button'
                className='rebuild-index-btn'
                onClick={handleRebuildIndex}
                disabled={isRebuildingIndex}
                title='重新构建搜索索引'
              >
                <FiRefreshCw className={isRebuildingIndex ? 'spinning' : ''} />
                {isRebuildingIndex ? '重建中...' : '重新构建索引'}
              </button>
            </div>
            {errors.indexPath && (
              <span className='error-message'>
                <FiAlertCircle />
                {errors.indexPath}
              </span>
            )}
          </div>

          {submitError && (
            <div className='error-notification'>
              <FiAlertCircle />
              {submitError}
            </div>
          )}

          <button
            type='submit'
            className='cache-and-index-submit-btn'
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存配置'}
          </button>
        </form>
      </div>
    </div>
  );
});

CacheAndIndexSetting.displayName = 'CacheAndIndexSetting';

export default CacheAndIndexSetting;
